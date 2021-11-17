import sys

def encryptSRNN(pt, publickey):
    n,e,ua = publickey
    op = pow((int(pt) * ua),e,n)
    return op

def makeVal(pt):
    ptn = ""
    for i in pt:
        # if i.islower():
        #     ptn += str(ord(i.upper()))
        # else:
        #     ptn += str(ord(i))
    
        temp = str(ord(i))
        if len(temp)==1:
            temp = "00" + temp
        if len(temp)==2:
            temp = "0" + temp
        ptn+=temp
    return ptn

def encrypt(pt, publickey):
    
    ptn = makeVal(pt)
    encryptedText = encryptSRNN(ptn,publickey)
    return encryptedText

pt = sys.argv[1]
publickey = [int(sys.argv[2]),int(sys.argv[3]),int(sys.argv[4])]
print(encrypt(pt,publickey))

