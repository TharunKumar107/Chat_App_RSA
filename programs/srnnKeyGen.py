import random
from getPrime import mainfn

def generateKey():
    # Get random values of p,q from getPrime fn
    p = mainfn()
    q = mainfn()

    # Calculate n
    n = p*q

    # Calculate Ruler toitent/ phi
    r = (p-1) * (q-1)

    # For finding GCD by Eucledian algorithm
    def egcd(e,r):
        while(r!=0):
            e,r=r,e%r
        return e

    for i in range(1,1000):
        if(egcd(i,r)==1):
            e=i


    # Extended Euclidean Algorithm
    def eea(a,b):
        if(a%b==0):
            return(b,0,1)
        else:
            gcd,s,t = eea(b,a%b)
            s = s-((a//b) * t)
            return(gcd,t,s)

    # Multiplicative inverse
    def mult_inv(e,r):
        gcd,s,_=eea(e,r)
        if(gcd!=1):
            return None
        else:
            return s%r

    # Find d
    d = mult_inv(e,r)


    u = random.randint(2,r-1)
    while u==r-1:
        u = random.randint(2,r-1)

    a = random.randint(u+1,r-1)



    ua = pow(u,a,n)
    return [n,e,ua,d,a,u,r] 


def mainfn1():
    keys = generateKey()
    print("The public key is: (",keys[0],",",keys[1],",",keys[2],")")
    print("The private key is:(",keys[3],",",keys[4],",",keys[5],",",keys[6],")")


if __name__ == '__main__':
    mainfn1()