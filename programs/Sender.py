from srnnEncrypt import encrypt

import socket


receiverPublicKey = ( 6441632381245105102845303224299619627408379834705757629106109601077650394409978617762745713119887198951106421397380242029327232168914351161709979983086131 , 999 , 3152176747341179562568040467871303599712199674729307246465517672864835591185847393906885762816795807233578005550443470222927467856138299726959553714273847 )
print("Hello user!")
message = input("Please enter your message: ")

ct = encrypt(message, receiverPublicKey)

print("Encrypted message is:",ct)


# Creating a new TCP connection

client_sock=socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_sock.connect(('127.0.0.10', 42069))
ct = "<#>"+ str(ct)
client_sock.send(bytes(str(ct), "utf-8"))
print("Message has been sent successfully!")   


'''
import time

startTime = time.time()
endTime = time.time()

print(startTime)
print(endTime)
print("Time for encryption %s seconds" % round(endTime - startTime, 10))

'''