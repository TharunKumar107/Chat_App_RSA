import sys, json

def decryptSRNN(publickey,privateKey,ct):
    d,a,u,r = privateKey
    n,e = publickey[0], publickey[1]

    v = pow(u,(r-a),n)
    m = pow(pow(v,e)*int(ct),d,n)
    return m

def convertToText(m):
    
    pt = ""
    for i in range(0,len(m),3):
        pt += chr(int(m[i:i+3]))
    return pt

def decrypt(ct,publickey,privateKey):
    m = decryptSRNN(publickey,privateKey,ct)
    m = str(m)
    rem = len(m)%3
    rem = 3 - rem
    if rem != 3:
        m = ("0" * rem) + m
    pt = convertToText(m)
    return pt

def printJSON(jsonF):
    print(json.dumps(jsonF))

ct_json = json.loads(sys.argv[1])
publickey = [int(sys.argv[2]),int(sys.argv[3]),int(sys.argv[4])]
privatekey = [int(sys.argv[5]),int(sys.argv[6]),int(sys.argv[7]),int(sys.argv[8])]
for i in range(len(ct_json)):
    decryptedmsg = decrypt(ct_json[i]['message'],publickey,privatekey)
    ct_json[i]['message'] = decryptedmsg

printJSON(ct_json)

# print(decrypt(ct,publickey,privatekey))
