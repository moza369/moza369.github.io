---
title: N7 CTF CRYPTO
time: 2024-05-12 
categories: [ctf]
tags: [crypto]
cover: /images/cover.jpeg
---

### First challenge

in this crypto challenge we get two files message.py nad output.py


# analyse the source code
this is the encrypt function:

	`def encrypt(message, key):
	    encrypted_message = ""
	    key_index = 0
	    for char in message:
	        key_value = int(key[key_index])
	        encrypted_char = chr(ord(char) + key_value)
	        encrypted_message += encrypted_char
	        key_index = (key_index + 1) % len(key)
	    return encrypted_message
`

and this key funct:

	`def generate_key(length):
    key = ""
    for _ in range(length):
        key += str(random.randint(0, 1))
    return key`

# get the flag

so the encryption adds 0 or 1 to the ord(message_char)

if 0 is added the character is not changed 

so we can try decrypting the encrypted message using 2 keys the first one all zeros second one all ones

`flag = 'itsfiuifs{esoprtfurbhpo'
key =  '11111111111111111111111'
lenght = len(flag)
for char in flag:
        message = ""
        key_index = 0
        key_value = int(key[key_index])
        encrypted_char = chr(ord(char) - key_value)
        message += encrypted_char
        key_index = (key_index + 1) % len(key)
        print(message)`

Decrypted (Key 11111111111111111111111): 

hsrehtherzdrnoqsetqagon

Decrypted (Key 00000000000000000000000): 

itsfiuifs{esoprtfurbhpo

since they give us english plaintext we can just try to get the correct flag 

itsfiuifs{esoprtfurbhpo

hsrehtherzdrnoqsetqagon

we get in result: 
# itseitherzeroortetargon

# key

for the key we can just compare betwen the flag and the ecnrypted text

itsfiuifs{esoprtfurbhpo
hsrehtherzdrnoqsetqagon

we get the key: 
# 00010111110101001101111


### Second challenge 
this challenge is too easy just use https://www.dcode.fr/rsa-cipher

c = 2639222037939602930779997597686066660027731122115841970751307118936967286551172831245185216904150318662068646683922890543361488253707451777944539953999880820333353409477004444838728567823330779562645224253848830988777624421

e = 3

n = 105685955572725005347272960743239621411993077386863604096770961745412000510196377797206820581777171869540729112886024112689923030604026133879334659352568724562364148963053997247996020334986347187697178849374917417289646475949679535200176152455407176055260974820531493339297291633199170870295476113587842624831

we get the flag

# flag:
  N7-CTF{just_s1mple_m3th_765622}
