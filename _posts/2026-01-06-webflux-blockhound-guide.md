---
title: "WebFlux 환경에서 BlockHound 를 통해 blocking call 탐지하기"
date: 2026-01-06
toc: true
toc_sticky: true
toc_label: "WebFlux 환경에서 BlockHound 를 통해 blocking call 탐지하기"
---

## 🐕 Spring WebFlux 와 BlockHound

Spring WebFlux 는 Netty 를 기반으로 Non-Blocking 방식의 프로그래밍 모델을 제공한다. 
이 덕분에 적은 수의 thread 로 수 많은 요청을 처리할 수 있다(C10K problem 해소)는 강점이 있다.
이 강점을 살리기 위해서는 WebFlux 프로젝트 전반에 걸쳐 Non-Blocking 방식으로 개발이 진행되어야 하는데,
단 한 곳에서라도 Blocking Call 이 발생하면, 그 플로우 전체가 더 이상 Non-Blocking 하지 않음(=Blocking)과 마찬가지기 때문이다.

개발자의 부단한 노력으로 눈에 보이는 모든 코드가 Non-Blocking 하게 작성되었다고 해도,
사용하는 여러 라이브러리 내부에서 Blocking Call 이 발생할 수 있다.
이런 Blocking Call 을 탐지하기 위해, project-reactor 에서는 Block 지점이 발견되면 예외를 발생시키는 [BlockHound 라이브러리](https://github.com/reactor/BlockHound)를 제공하고 있다.

<br>

## 🐕 BlockHound 설정 방법

gradle 기준, `build.gradle.kts` 에 아래와 같이 의존성을 추가한다.

```kotlin
dependencies {
    implementation("io.projectreactor.tools:blockhound:{최신버전}.RELEASE")
}
```

이후 애플리케이션 초기화 시점(예: `main` 함수 혹은 `@SpringBootApplication` 이 붙은 클래스 내부)에서 BlockHound 를 활성화 시키는 방식이 제안되는데,
개인적으로 별개 `Configuration` 클래스를 만들어 설정하는 방식을 선호한다.
(main 함수는 개발자들이 의도적으로 확인하는 일이 적기 때문)

```kotlin
@Configuration
class BlockHoundConfig {

    @PostConstruct
    fun installBlockHound() {
        BlockHound.install()
    }
}
```

간단하게 설정을 마치면 이제 WebFlux 애플리케이션 시작 시점부터 ByteCode 를 분석해서
Blocking Call 발생 시점에 `BlockingOperationError` 예외가 발생하게 된다.

아래는 swagger-ui 를 통해 정적 리소스에 접근하는 과정에서 Blocking Call 이 탐지된 로그 예시이다.

```
ERROR 26-01-06 01:07:53 [parallel-8] [GlobalExceptionHandler:75] - Blocking call! java.io.RandomAccessFile#readBytes
reactor.blockhound.BlockingOperationError: Blocking call! java.io.RandomAccessFile#readBytes
	at java.base/java.io.RandomAccessFile.readBytes(RandomAccessFile.java)
	Suppressed: reactor.core.publisher.FluxOnAssembly$OnAssemblyException: 
Assembly trace from producer [reactor.core.publisher.FluxConcatMapNoPrefetch] :
	reactor.core.publisher.Flux.concatMap(Flux.java:4053)
	org.springframework.web.reactive.resource.PathResourceResolver.getResource(PathResourceResolver.java:95)
Error has been observed at the following site(s):
	*______Flux.concatMap ⇢ at org.springframework.web.reactive.resource.PathResourceResolver.getResource(PathResourceResolver.java:95)
	|_          Flux.next ⇢ at org.springframework.web.reactive.resource.PathResourceResolver.getResource(PathResourceResolver.java:96)
	|_ Mono.switchIfEmpty ⇢ at org.springframework.web.reactive.resource.LiteWebJarsResourceResolver.resolveResourceInternal(LiteWebJarsResourceResolver.java:74)
	|_       Mono.flatMap ⇢ at org.springframework.web.reactive.resource.ResourceWebHandler.getResource(ResourceWebHandler.java:499)
	|_ Mono.switchIfEmpty ⇢ at org.springframework.web.reactive.resource.ResourceWebHandler.handle(ResourceWebHandler.java:430)
	|_       Mono.flatMap ⇢ at org.springframework.web.reactive.resource.ResourceWebHandler.handle(ResourceWebHandler.java:434)
	*___________Mono.then ⇢ at org.springframework.web.reactive.result.SimpleHandlerAdapter.handle(SimpleHandlerAdapter.java:46)
Original Stack Trace:
		at java.base/java.io.RandomAccessFile.readBytes(RandomAccessFile.java)
		at java.base/java.io.RandomAccessFile.read(RandomAccessFile.java:405)
		at java.base/java.io.RandomAccessFile.readFully(RandomAccessFile.java:469)
		at java.base/java.util.zip.ZipFile$Source.readFullyAt(ZipFile.java:1516)
		at java.base/java.util.zip.ZipFile$ZipFileInputStream.initDataOffset(ZipFile.java:923)
		at java.base/java.util.zip.ZipFile$ZipFileInputStream.read(ZipFile.java:939)
		at java.base/java.util.zip.ZipFile$ZipFileInflaterInputStream.fill(ZipFile.java:456)
		at java.base/java.util.zip.InflaterInputStream.read(InflaterInputStream.java:158)
		at java.base/java.io.InputStream.readNBytes(InputStream.java:506)
		at java.base/java.util.jar.JarFile.getBytes(JarFile.java:816)
		at java.base/java.util.jar.JarFile.checkForSpecialAttributes(JarFile.java:1006)
		at java.base/java.util.jar.JarFile.isMultiRelease(JarFile.java:388)
		at java.base/java.util.jar.JarFile.getEntry(JarFile.java:510)
		at java.base/sun.net.www.protocol.jar.URLJarFile.getEntry(URLJarFile.java:131)
		at java.base/sun.net.www.protocol.jar.JarURLConnection.connect(JarURLConnection.java:135)
		at java.base/sun.net.www.protocol.jar.JarURLConnection.getJarEntry(JarURLConnection.java:97)
		at org.springframework.core.io.AbstractFileResolvingResource.checkReadable(AbstractFileResolvingResource.java:157)
		at org.springframework.core.io.ClassPathResource.isReadable(ClassPathResource.java:168)
		at org.springframework.web.reactive.resource.PathResourceResolver.getResource(PathResourceResolver.java:110)
		at org.springframework.web.reactive.resource.PathResourceResolver.lambda$getResource$1(PathResourceResolver.java:95)
		at reactor.core.publisher.FluxConcatMapNoPrefetch$FluxConcatMapNoPrefetchSubscriber.onNext(FluxConcatMapNoPrefetch.java:183)
		(생략)
```

`reactor.blockhound.BlockingOperationError: Blocking call! java.io.RandomAccessFile#readBytes` 가 정확한 Blocking Call 발생 지점이다.

<br>

## 🐕 BlockHound 커스텀 예외 추가하기

아무리 Non-Blocking 한 프로그램을 개발한다고 해도, 필수적으로 Blocking Call 이 필요한 경우들이 있다.
최초로 DB connection 을 맺는 과정, 파일 시스템에 접근하는 과정 등이 대표적이다.
이런 경우 BlockHound 가 예외 처리를 할 수 있도록 커스텀 예외를 추가할 수 있다.

```kotlin
@Configuration
class BlockHoundConfig {
    
    @PostConstruct
    fun installBlockHound() {
      BlockHound.install(BlockHoundIntegration { builder ->
            builder.allowBlockingCallsInside(
                "com.example.project.util.FileUtils", // 예외를 허용할 class name
                "readFileContent" // 예외를 허용할 class's method name
            )
      })
    }
}
```

필수적으로 Blocking Call 이 필요한 지점이 한 두 곳이 아니라 일일히 커스텀 예외를 추가하는 것이 번거로울 수 있다.
당연히 project-reactor 진영에서도 문제점을 인지하고 있기 때문에, 많은 사용자들이 예외처리하는 지점에 대해서는 기본적인 예외처리를 제공하고 있다.

<img width="915" height="545" alt="Image" src="https://github.com/user-attachments/assets/babbfa17-70e1-4ba1-8b45-f0473f2f84e8" />

<br>

## 🐕 BlockHound 를 더 잘 사용하기

앞서 swagger-ui 정적 리소스 접근 과정에서 Blocking Call 이 탐지된 예시를 다시 살펴보자.

```
ERROR 26-01-06 01:07:53 [parallel-8] [GlobalExceptionHandler:75] - Blocking call! java.io.RandomAccessFile#readBytes
reactor.blockhound.BlockingOperationError: Blocking call! java.io.RandomAccessFile#readBytes
	at java.base/java.io.RandomAccessFile.readBytes(RandomAccessFile.java)
	Suppressed: reactor.core.publisher.FluxOnAssembly$OnAssemblyException: 
Assembly trace from producer [reactor.core.publisher.FluxConcatMapNoPrefetch] :
	reactor.core.publisher.Flux.concatMap(Flux.java:4053)
	org.springframework.web.reactive.resource.PathResourceResolver.getResource(PathResourceResolver.java:95)
Error has been observed at the following site(s):
	*______Flux.concatMap ⇢ at org.springframework.web.reactive.resource.PathResourceResolver.getResource(PathResourceResolver.java:95)
	|_          Flux.next ⇢ at org.springframework.web.reactive.resource.PathResourceResolver.getResource(PathResourceResolver.java:96)
	|_ Mono.switchIfEmpty ⇢ at org.springframework.web.reactive.resource.LiteWebJarsResourceResolver.resolveResourceInternal(LiteWebJarsResourceResolver.java:74)
	|_       Mono.flatMap ⇢ at org.springframework.web.reactive.resource.ResourceWebHandler.getResource(ResourceWebHandler.java:499)
	|_ Mono.switchIfEmpty ⇢ at org.springframework.web.reactive.resource.ResourceWebHandler.handle(ResourceWebHandler.java:430)
	|_       Mono.flatMap ⇢ at org.springframework.web.reactive.resource.ResourceWebHandler.handle(ResourceWebHandler.java:434)
	*___________Mono.then ⇢ at org.springframework.web.reactive.result.SimpleHandlerAdapter.handle(SimpleHandlerAdapter.java:46)
Original Stack Trace:
		at java.base/java.io.RandomAccessFile.readBytes(RandomAccessFile.java)
		at java.base/java.io.RandomAccessFile.read(RandomAccessFile.java:405)
		at java.base/java.io.RandomAccessFile.readFully(RandomAccessFile.java:469)
		at java.base/java.util.zip.ZipFile$Source.readFullyAt(ZipFile.java:1516)
		at java.base/java.util.zip.ZipFile$ZipFileInputStream.initDataOffset(ZipFile.java:923)
		at java.base/java.util.zip.ZipFile$ZipFileInputStream.read(ZipFile.java:939)
		at java.base/java.util.zip.ZipFile$ZipFileInflaterInputStream.fill(ZipFile.java:456)
		at java.base/java.util.zip.InflaterInputStream.read(InflaterInputStream.java:158)
		at java.base/java.io.InputStream.readNBytes(InputStream.java:506)
		at java.base/java.util.jar.JarFile.getBytes(JarFile.java:816)
		at java.base/java.util.jar.JarFile.checkForSpecialAttributes(JarFile.java:1006)
		at java.base/java.util.jar.JarFile.isMultiRelease(JarFile.java:388)
		at java.base/java.util.jar.JarFile.getEntry(JarFile.java:510)
		at java.base/sun.net.www.protocol.jar.URLJarFile.getEntry(URLJarFile.java:131)
		at java.base/sun.net.www.protocol.jar.JarURLConnection.connect(JarURLConnection.java:135)
		at java.base/sun.net.www.protocol.jar.JarURLConnection.getJarEntry(JarURLConnection.java:97)
		at org.springframework.core.io.AbstractFileResolvingResource.checkReadable(AbstractFileResolvingResource.java:157)
		at org.springframework.core.io.ClassPathResource.isReadable(ClassPathResource.java:168)
		at org.springframework.web.reactive.resource.PathResourceResolver.getResource(PathResourceResolver.java:110)
		at org.springframework.web.reactive.resource.PathResourceResolver.lambda$getResource$1(PathResourceResolver.java:95)
		at reactor.core.publisher.FluxConcatMapNoPrefetch$FluxConcatMapNoPrefetchSubscriber.onNext(FluxConcatMapNoPrefetch.java:183)
		(생략)
```

위 로그를 보면 `java.io.RandomAccessFile#readBytes` 에서 Blocking Call 이 탐지된 것을 알 수 있다.
단순히 해당 지점에 대해 커스텀 예외를 추가하면 될까?

```kotlin
@Configuration
class BlockHoundConfig {
    
    @PostConstruct
    fun installBlockHound() {
      BlockHound.install(BlockHoundIntegration { builder ->
            builder.allowBlockingCallsInside("java.io.RandomAccessFile", "readBytes")
      })
    }
}
```

당장의 예외는 해소되어 정상적으로 swagger-ui 가 동작할 수 있겠지만, 타 라이브러리나 개발자 실수로 대상 메서드가 호출되는 지점이 생겼을 때 Blocking 탐지가 어렵게 된다.
`RandomAccessFile` 클래스는 `java.io` 패키지에 속해있는 JDK 기본 클래스이기 때문에, 다른 라이브러리나 개발자 코드에서 해당 클래스를 사용하는 일이 너무나 쉽게 생길 수 있다.
따라서 BlockHound 커스텀 예외 추가 시점에서는 Blocking Call 을 발생시키는 케이스를 파악해서 조심스럽게 예외를 추가하는 것이 좋겠다.

로그를 자세히 살펴보면, resource resolving 시점에 Blocking Call 이 발생하는 것을 추측할 수 있다.
`PathResourceResolver#getResource` 에 대해 커스텀 예외를 추가하고 다시 한 번 swagger-ui 에 접근을 시도하면 어떤 변화가 생길까?

```kotlin
@Configuration
class BlockHoundConfig {

    @PostConstruct
    fun installBlockHound() {
        BlockHound.install(BlockHoundIntegration { builder ->
            builder
                .allowBlockingCallsInside("org.springframework.web.reactive.resource.PathResourceResolver", "getResource")
        })
    }
}
```
```
ERROR 26-01-06 14:11:03 [parallel-1] [GlobalExceptionHandler:75] - Blocking call! java.io.RandomAccessFile#readBytes
reactor.blockhound.BlockingOperationError: Blocking call! java.io.RandomAccessFile#readBytes
	at java.base/java.io.RandomAccessFile.readBytes(RandomAccessFile.java)
	Suppressed: reactor.core.publisher.FluxOnAssembly$OnAssemblyException: 
Assembly trace from producer [reactor.core.publisher.MonoFlatMap] :
	reactor.core.publisher.Mono.flatMap(Mono.java:3179)
	org.springframework.web.reactive.resource.ResourceWebHandler.getResource(ResourceWebHandler.java:499)
Error has been observed at the following site(s):
	*________Mono.flatMap ⇢ at org.springframework.web.reactive.resource.ResourceWebHandler.getResource(ResourceWebHandler.java:499)
	|_ Mono.switchIfEmpty ⇢ at org.springframework.web.reactive.resource.ResourceWebHandler.handle(ResourceWebHandler.java:430)
	|_       Mono.flatMap ⇢ at org.springframework.web.reactive.resource.ResourceWebHandler.handle(ResourceWebHandler.java:434)
	*___________Mono.then ⇢ at org.springframework.web.reactive.result.SimpleHandlerAdapter.handle(SimpleHandlerAdapter.java:46)
Original Stack Trace:
		at java.base/java.io.RandomAccessFile.readBytes(RandomAccessFile.java)
		at java.base/java.io.RandomAccessFile.read(RandomAccessFile.java:405)
		at java.base/java.io.RandomAccessFile.readFully(RandomAccessFile.java:469)
		at java.base/java.util.zip.ZipFile$Source.readFullyAt(ZipFile.java:1516)
		at java.base/java.util.zip.ZipFile$ZipFileInputStream.initDataOffset(ZipFile.java:923)
		at java.base/java.util.zip.ZipFile$ZipFileInputStream.read(ZipFile.java:939)
		at java.base/java.util.zip.ZipFile$ZipFileInflaterInputStream.fill(ZipFile.java:456)
		at java.base/java.util.zip.InflaterInputStream.read(InflaterInputStream.java:158)
		at java.base/java.io.FilterInputStream.read(FilterInputStream.java:132)
		at java.base/java.io.FilterInputStream.read(FilterInputStream.java:106)
		at org.springdoc.ui.AbstractSwaggerIndexTransformer.readFullyAsString(AbstractSwaggerIndexTransformer.java:118)
		at org.springdoc.ui.AbstractSwaggerIndexTransformer.defaultTransformations(AbstractSwaggerIndexTransformer.java:153)
		at org.springdoc.webflux.ui.SwaggerIndexPageTransformer.transform(SwaggerIndexPageTransformer.java:82)
		at org.springframework.web.reactive.resource.DefaultResourceTransformerChain.transform(DefaultResourceTransformerChain.java:89)
		at org.springframework.web.reactive.resource.ResourceWebHandler.lambda$getResource$3(ResourceWebHandler.java:499)
		at reactor.core.publisher.MonoFlatMap$FlatMapMain.onNext(MonoFlatMap.java:132)
		(생략)
```

이번엔 resource resolving 이 아닌 swagger index transforming 시점에 Blocking Call 이 발생하는 것을 알 수 있다.
마찬가지로 swagger index transforming 시점에 대해서도 커스텀 예외를 추가해보자.

```kotlin
@Configuration
class BlockHoundConfig {

    @PostConstruct
    fun installBlockHound() {
        BlockHound.install(BlockHoundIntegration { builder ->
            builder
                .allowBlockingCallsInside("org.springframework.web.reactive.resource.PathResourceResolver", "getResource")
                .allowBlockingCallsInside("org.springdoc.ui.AbstractSwaggerIndexTransformer", "readFullyAsString")
        })
    }
}
```
```
ERROR 26-01-06 14:12:53 [parallel-5] [GlobalExceptionHandler:75] - Blocking call! java.io.RandomAccessFile#readBytes
	at java.base/java.io.RandomAccessFile.readBytes(RandomAccessFile.java)
	at java.base/java.io.RandomAccessFile.read(RandomAccessFile.java:405)
	at java.base/java.io.RandomAccessFile.readFully(RandomAccessFile.java:469)
	at java.base/java.util.zip.ZipFile$Source.readFullyAt(ZipFile.java:1516)
	at java.base/java.util.zip.ZipFile$ZipFileInputStream.initDataOffset(ZipFile.java:923)
	at java.base/java.util.zip.ZipFile$ZipFileInputStream.read(ZipFile.java:939)
	at java.base/java.util.zip.ZipFile$ZipFileInflaterInputStream.fill(ZipFile.java:456)
	at java.base/java.util.zip.InflaterInputStream.read(InflaterInputStream.java:158)
	at java.base/java.io.FilterInputStream.read(FilterInputStream.java:132)
	at org.springframework.asm.ClassReader.readStream(ClassReader.java:323)
	at org.springframework.asm.ClassReader.<init>(ClassReader.java:288)
	at org.springframework.core.type.classreading.SimpleMetadataReader.getClassReader(SimpleMetadataReader.java:56)
	at org.springframework.core.type.classreading.SimpleMetadataReader.<init>(SimpleMetadataReader.java:48)
	at org.springframework.core.type.classreading.SimpleMetadataReaderFactory.getMetadataReader(SimpleMetadataReaderFactory.java:103)
	at org.springframework.core.type.classreading.CachingMetadataReaderFactory.getMetadataReader(CachingMetadataReaderFactory.java:131)
	at org.springframework.core.type.classreading.SimpleMetadataReaderFactory.getMetadataReader(SimpleMetadataReaderFactory.java:81)
	at org.springframework.core.type.filter.AbstractTypeHierarchyTraversingFilter.match(AbstractTypeHierarchyTraversingFilter.java:127)
	at org.springframework.core.type.filter.AbstractTypeHierarchyTraversingFilter.match(AbstractTypeHierarchyTraversingFilter.java:83)
	at org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider.isCandidateComponent(ClassPathScanningCandidateComponentProvider.java:546)
	at org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider.scanCandidateComponents(ClassPathScanningCandidateComponentProvider.java:471)
	at org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider.findCandidateComponents(ClassPathScanningCandidateComponentProvider.java:351)
	at org.springdoc.core.service.OpenAPIService.getApiDefClass(OpenAPIService.java:774)
	at org.springdoc.core.service.OpenAPIService.getOpenAPIDefinition(OpenAPIService.java:535)
	at org.springdoc.core.service.OpenAPIService.build(OpenAPIService.java:241)
	at org.springdoc.api.AbstractOpenApiResource.getOpenApi(AbstractOpenApiResource.java:352)
	at org.springdoc.webflux.api.OpenApiResource.openapiJson(OpenApiResource.java:123)
	at org.springdoc.webflux.api.OpenApiWebfluxResource.openapiJson(OpenApiWebfluxResource.java:119)
	at org.springdoc.webflux.api.MultipleOpenApiWebFluxResource.openapiJson(MultipleOpenApiWebFluxResource.java:98)
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	(생략)
```

swagger index transforming 시점에 대해서도 커스텀 예외를 추가했더니, 이번엔 OpenAPI 정의를 생성하는 시점에 Blocking Call 이 발생하는 것을 알 수 있다
이 단계까지 도달했다면 `openapiJson` 메서드에 대해 커스텀 예외를 추가해도 충분하니, `org.springdoc.webflux.api.MultipleOpenApiWebFluxResource#openapiJson` 에 대해 
마지막 커스텀 예외를 추가해보자.

```kotlin
@Configuration
class BlockHoundConfig {

    @PostConstruct
    fun installBlockHound() {
        BlockHound.install(BlockHoundIntegration { builder ->
            builder
                .allowBlockingCallsInside("org.springframework.web.reactive.resource.PathResourceResolver", "getResource")
                .allowBlockingCallsInside("org.springdoc.ui.AbstractSwaggerIndexTransformer", "readFullyAsString")
                .allowBlockingCallsInside("org.springdoc.webflux.api.MultipleOpenApiWebFluxResource", "openapiJson")
        })
    }
}
```

비로소 swagger-ui 정적 리소스 접근 시 Blocking Call 이 탐지되지 않고 정상적으로 swagger 문서를 확인할 수 있게 된다.

이와 같은 방식으로 Blocking call 탐지 로그를 자세히 살펴보면서 정말 필요한 부분에만 fit 하게 커스텀 예외를 추가하는게 좋겠다.

마지막으로, BlockHound 는 의도적으로 '예외를 발생 시키는' 라이브러리다. 
때문에 개발 혹은 테스트 환경에서 BlockHound 를 통해 Blocking 지점을 파악 후 코드를 개선하고
운영 환경에서는 BlockHound 를 비활성화 하는 방식을 권장한다.

```kotlin
@Profile("local") // 개발 및 테스트 환경에서만 활성화
@Configuration
class BlockHoundConfig {

    @PostConstruct
    fun installBlockHound() {
        BlockHound.install(BlockHoundIntegration { builder ->
            builder
                .allowBlockingCallsInside("org.springframework.web.reactive.resource.PathResourceResolver", "getResource")
                .allowBlockingCallsInside("org.springdoc.ui.AbstractSwaggerIndexTransformer", "readFullyAsString")
                .allowBlockingCallsInside("org.springdoc.webflux.api.MultipleOpenApiWebFluxResource", "openapiJson")
        })
    }
}
```

<br>

## References

- [BlockHound GitHub Repository](https://github.com/reactor/BlockHound)
