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

def mainfn():
    pt = "Your OPT is 785201. Don't share with anyone."
    publickey = ( 6441632381245105102845303224299619627408379834705757629106109601077650394409978617762745713119887198951106421397380242029327232168914351161709979983086131 , 999 , 3152176747341179562568040467871303599712199674729307246465517672864835591185847393906885762816795807233578005550443470222927467856138299726959553714273847 )
    print(encrypt(pt,publickey))

if __name__ == '__main__':
    mainfn()