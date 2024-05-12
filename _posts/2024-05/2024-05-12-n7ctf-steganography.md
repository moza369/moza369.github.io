---
title: N7 CTF STEGO
time: 2024-05-12 
categories: [ctf]
tags: [steganography]
---

# stego 1
we have this paragraph: 

	`Capture the Flag (CTF) in computer security is an exercise in which participants attempt to find text strings, called "flags", which are secretly hidden in purposefully-vulnerable programs or websites. They can be used for both competitive or educational purposes. In two main variations of CTFs, participants either steal flags from other participants (attack/defense-style CTFs) or from organizers (jeopardy-style challenges). A mixed competition combines these two styles.[1] Competitions can include hiding flags in hardware devices, they can be both online or in-person, and can be advanced or entry-level. The game is inspired by the traditional outdoor sport of the same name.`

in the description of this challenge they say something about zipf's law
but the main idea is to calculate the frequency of the repeated caracters 

using: `https://www.dcode.fr/frequency-analyCapture` 

we get the 
# flag: ETIASNROCLPHDFMUYGBWVX

don't forget to add N7-CTF{} :)

# stego 2

we have a .png image but when we try to open it doesn't work 

we need to add the png header with hexedit

1- `hexedit photo.png`

2- add this in the first line 89 50 4E 47 0D 0A 1A 0A	

3- save the changes

so now we have a photo 

lets use some stego tools 
i use stegsolve.jar 

1- java -jar stegsolve.jar

2- opne the photo

3- find the flag 

# flag:
  N7-CTF{ju57_w4n73d_70 w4573_y0ur_71m3} 
