## Aby uruchomić bazę w docker 
```
docker run -d --name redis-stack -v C:\Users\Lorek\Desktop\noSql_project\redis.conf:/usr/local/etc/redis/redis.conf -p 6379:6379 -p 8001:8001 redis/redis-stack:latest

docker run -v `pwd`C:\Users\Lorek\Desktop\noSql_project\redis.conf:/redis-stack.conf -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

# Todo:
* Wydzielić parametry ciała do osobnych wpisów 

```
Trzymanie wszystkich parametrów w jednym dataset może być wygodne i uprościć operacje związane z pobieraniem danych, jednak ma pewne wady, które warto rozważyć:

### Zalety trzymania wszystkich parametrów w jednym dataset:
1. **Łatwość dostępu**: Można łatwo pobrać wszystkie dane na raz, co jest przydatne w przypadku, gdy potrzebujesz wszystkich parametrów dla danego punktu czasowego.
2. **Mniej kluczy w Redis**: Mniej kluczy oznacza łatwiejsze zarządzanie bazą danych.

### Wady trzymania wszystkich parametrów w jednym dataset:
1. **Brak elastyczności**: Jeśli chcesz analizować lub pobierać dane tylko dla jednego typu parametru (np. tylko temperaturę), musisz przefiltrować wszystkie dane, co może być nieefektywne.
2. **Potencjalne problemy z wielkością**: Przy dużej ilości danych JSON może stać się duży i nieefektywny w zarządzaniu.

### Zalety trzymania parametrów w oddzielnych zbiorach:
1. **Elastyczność**: Możliwość łatwego pobierania i analizowania danych dla konkretnego typu parametru.
2. **Skalowalność**: Lepsza wydajność i skalowalność, ponieważ dane są bardziej rozproszone i specyficzne.
3. **Łatwiejsze zarządzanie danymi**: Możliwość zarządzania danymi dla różnych parametrów niezależnie.

### Wady trzymania parametrów w oddzielnych zbiorach:
1. **Więcej kluczy w Redis**: Potrzebujesz więcej kluczy, co może skomplikować zarządzanie bazą danych.
2. **Złożoność**: Operacje związane z pobieraniem wszystkich parametrów naraz mogą być bardziej złożone i wymagać dodatkowego kodu do agregacji wyników.

### Podsumowanie:
Decyzja o wyborze podejścia zależy od konkretnego przypadku użycia. Jeśli często potrzebujesz wszystkich parametrów naraz i baza danych nie będzie zbyt duża, trzymanie ich w jednym dataset może być wygodne. Jeśli jednak wymagasz większej elastyczności i przewidujesz dużą ilość danych, lepszym rozwiązaniem może być trzymanie parametrów w oddzielnych zbiorach.
```