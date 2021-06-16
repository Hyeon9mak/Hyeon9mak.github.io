---
title: "SimpleJdbcInsert를 통한 쉬운 Insert"
date: 2021-06-16
tags:
    - Java
    - JdbcTemplate
toc: true
toc_sticky: true
toc_label: "SimpleJdbcInsert를 통한 쉬운 Insert"
---

```java
    private final JdbcTemplate jdbcTemplate;

    public StationDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void insert(final Station station) {
        String sql = "INSERT INTO station(name) VALUES(?)";
        jdbcTemplate.update(sql, station.getName());
    }
```

새로 생성된 Station 객체를 데이터베이스의 STATION 테이블에 삽입하는 코드다.

JdbcTemplate를 사용하면서 데이터베이스에 값을 직접 삽입하다보면, 삽입 직후 조회(READ) 과정없이 곧장 
삽입된 데이터의 primary key 값을 얻고 싶을 때가 있다. (아주 많다)

JdbcTemplate만을 사용해서도 이를 충분히 구현할 수 있지만, 코드의 가독성이 기하급수 적으로 떨어진다.

<br>

## KeyHolder 사용 방식

```java
    private final JdbcTemplate jdbcTemplate;

    public StationDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Station insert(final Station station) {
        String sql = "INSERT INTO station(name) VALUES(?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        this.jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection
                .prepareStatement(sql, new String[]{"id"});
            ps.setString(1, station.getName());
            return ps;
        }, keyHolder);

        return new Station(keyHolder.getKey().longValue(),
            station.getName());
    }
```

`keyHolder` 객체를 통해 삽입 직후 pirmary key 값을 잡아내게 되는데, 가독성이 여간 떨어지는게 아니다.
예외처리를 위해 try-catch 키워드가 포함되기라도 한다면 정말 저세상의 가독성을 가진 메서드가 탄생한다.

```java
    private final JdbcTemplate jdbcTemplate;

    public StationDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Station insert(final Station station) {
        try {
            String sql = "INSERT INTO station(name) VALUES(?)";

            KeyHolder keyHolder = new GeneratedKeyHolder();
            this.jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection
                    .prepareStatement(sql, new String[]{"id"});
                ps.setString(1, station.getName());
                return ps;
            }, keyHolder);

            return new Station(keyHolder.getKey().longValue(),
                station.getName());
        } catch (DuplicateKeyException e) {
            ...
        }
    }
```
...🤦‍♂️

다행히 JdbcTemplate 개발 측에서도 이 문제를 인지하고 있었는지, 가독성과 편의를 확 올려주는 클래스를 제공하고 있다.

<br>

## SimpleJdbcInsert 사용 방식
```java
    private final JdbcTemplate jdbcTemplate;
    private final SimpleJdbcInsert jdbcInsert;

    public StationDao(JdbcTemplate jdbcTemplate, DataSource source) {
        this.jdbcTemplate = jdbcTemplate;
        this.jdbcInsert = new SimpleJdbcInsert(source)
            .withTableName("STATION")
            .usingGeneratedKeyColumns("id");
    }


    public Station insert(Station station) {
        try {
            Map<String, String> params = new HashMap<>();
            params.put("name", station.getName());
            Long id = jdbcInsert.executeAndReturnKey(params).longValue();

            return new Station(id, station.getName());
        } catch (DuplicationKeyException e) {
            ...
        }
    }
```

Map 자료구조로 필요한 파라미터 값들을 미리 대입시키고, `SimpleJdbcInsert.executeAndReturnKey(Map).longValue()` 를 수행하면 곧장 primary key 값을 얻어낼 수 있다.

이 동작이 가능하게 한 핵심은 생성자 쪽의 `withTableName()`과 `usingGeneratedKeyColumns`다.

```java
    public StationDao(JdbcTemplate jdbcTemplate, DataSource source) {
        this.jdbcTemplate = jdbcTemplate;
        this.jdbcInsert = new SimpleJdbcInsert(source) // 데이터소스로 DB에 접근해라.
            .withTableName("STATION")                  // 'STATION' 테이블에 삽입해라.
            .usingGeneratedKeyColumns("id");           // 'id' 컬럼의 값을 key로 반환해라.
    }
```

primary key 값을 얻어내는 과정은 우아해졌지만, Map 자료구조를 사용하는게 다소 아쉽다.  
이를 보완하기 위해 `SqlParameterSource` 인터페이스가 활용되는데, 스프링에서 `SqlParameterSource`의 
구현체를 다수 제공하고 있다. 그 중에서 자주 사용되는 2가지를 알아보자!

<br>

## SqlParameterSource - MapSqlParameterSource
```java
    public Station insert(Station station) {
        try {
            SqlParameterSource params = new MapSqlParameterSource()
                .addValue("name", station.getName())
                .addValue(..., ...);
            Long id = jdbcInsert.executeAndReturnKey(params).longValue();

            return new Station(id, station.getName());
        } catch (DuplicationKeyException e) {
            ...
        }
    }
```
`MapSqlParameterSource`는 Map 과 비슷하지만, `addValue` 메서드를 통해 체인으로 연결할 수 있어 
더 편리하다.

<br>

## SqlParameterSource - BeanPropertySqlParameterSource
```java
    public Station insert(Station station) {
        try {
            SqlParameterSource params = new BeanPropertySqlParameterSource(station);

            Long id = jdbcInsert.executeAndReturnKey(params).longValue();

            return new Station(id, station.getName());
        } catch (DuplicationKeyException e) {
            ...
        }
    }
```
Java Bean 호환(생성자, getter/setter를 가진) 객체라면 `BeanPropertySqlParameterSource` 를 통해 아주 간결하고 우아한 코드를 
작성할 수 있다. `BeanPropertySqlParameterSource`는 객체의 필드 값을 추출하는데 같은 이름으로 대응되는 getter 메서드를 필요로 한다.

<br>

## References
- [Class SimpleJdbcInsert - Spring Docs](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/core/simple/SimpleJdbcInsert.html)
- [[Spring 레퍼런스] 13장 JDBC를 사용한 데이터 접근 #2](https://blog.outsider.ne.kr/883)