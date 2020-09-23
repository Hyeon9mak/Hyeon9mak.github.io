```python
def DFS(begin, target, words, count):
    if begin == target :
        return count

    for word in words :
        diff = 0
        for i, j in zip(begin, word):
            if i != j:
                diff += 1
        if diff == 1 :
            DFS(word, target, words, count+1)
    

def solution(begin, target, words):
    if target not in words :
        return 0
    else :
        return DFS(begin, target, words, 0)
```