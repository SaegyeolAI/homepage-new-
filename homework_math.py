print("조립제법 프로그램")

n = int(input("최고차수를 입력하세요: "))

coeff = []
i = 0
while i <= n:
    c = int(input("계수 입력: "))
    coeff.append(c)
    i = i + 1

r = int(input("r 값을 입력하세요: "))

remainder = coeff[0]
quot = []

i = 1
while i <= n:
    quot.append(remainder)
    remainder = remainder * r + coeff[i]
    i = i + 1

print("몫:", quot)
print("나머지:", remainder)

if remainder == 0:
    print("r은 해입니다!")
else:
    print("r은 해가 아닙니다.")

#너무 어려워서 울면서 만들었습니다..