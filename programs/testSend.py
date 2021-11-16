import socket

client_sock=socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_sock.connect(('127.0.0.10', 42069))
ct = "hello"
print("sending:",ct)
client_sock.send(bytes(str(ct), "utf-8"))
print("Message has been sent successfully!")  