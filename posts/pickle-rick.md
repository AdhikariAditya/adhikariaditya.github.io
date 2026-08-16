# TryHackMe Challenge Room: Pickle Rick

**Difficulty:** Easy

**Estimated Time:** 30 minutes

**Done by:** Aditya Adhikari

---

## Introduction

As a beginner who is trying to get into cybersecurity and someone with a terrible sense of humor, a Pickle Rick CTF seemed perfect for me. So here's a step by step guide on my approach into solving this room.

## Preliminary steps

Before I even approached any of the tasks, there were a few preliminary steps I did. First and foremost, I went to the given lab machine IP to check out the website.

![Pickle Rick website homepage with the "Help Morty!" message](/posts/images/pickle-rick/first.png)

This gave me a basic sense of what the task was going to be about, how I needed to approach it and the tools I would need to use. I also checked out the code of the website to check if there were any clues hidden there too; lucky for me, there was something:

![Page source revealing a hidden username in an HTML comment](/posts/images/pickle-rick/second.png)

The username hidden in plain sight.

After this step, I ran a very simple nmap command to find any open ports on the IP.

![nmap output](/posts/images/pickle-rick/third.png)

With these two steps done, it's now time to start tackling the main challenge.

---

## Task 1: What is the first ingredient that Rick needs?

The username to the website has been successfully achieved, now it's time to find any hidden directories in the website by using the gobuster command.

```console
root@ip-10-65-121-59:~# gobuster dir -u http://10.65.179.173 -w /usr/share/wordlists/dirbuster/directory-list-lowercase-2.3-medium.txt -x .php,.js
```

![First gobuster run showing discovered directories](/posts/images/pickle-rick/fourth.png)

I added the extra .php and .js extension since if a login is in play, then the directory must have those extensions to process any login requests.

![Portal login page found at /login.php](/posts/images/pickle-rick/fifth.png)

Now we already have the login from before, so lets see what the password might be.

Here I fumbled slightly, my initial thought was to brute force the connection using a simple hydra command.

![Hydra brute-force attempt against the login form](/posts/images/pickle-rick/sixth.png)

However, even after getting supposedly 16 cracked passwords, none of them worked whatsoever.

Without a working password I was stumped. Deciding to use the challenge's simplicity against itself, I used gobuster to check if the website would just have a .txt file with the password lying around. So with a slight modification to the gobuster command, I saw 2 interesting txt files:

![Gobuster with modification](/posts/images/pickle-rick/seventh.png)

`clue.txt` was a very simple website with no page source and a single line that read, "Look around the file system for the other ingredient". Not much help to me, however `robots.txt` was slightly more interesting. It was similar to the last website, however it contained one word:

![The robots.txt file containing a single word used as the password](/posts/images/pickle-rick/eighth.png)

Using this as the password, I managed to login and was promptly redirected to the `/portal.php` website.

![The Rick Portal command panel](/posts/images/pickle-rick/ninth.png)

I entered in "ls" in the command box and got this:

![Output of the ls command listing files including the secret ingredient file](/posts/images/pickle-rick/tenth.png)

The obvious next step would be to enter "cat Sup3rS3cretPickl3Ingred.txt", however, even this proved useless and I was faced with:

![A "Command disabled" message blocking the cat command](/posts/images/pickle-rick/eleventh.png)

Going back, I realized that the remaining results after using the "ls" command were all directories in the website, so after entering in `http://10.65.179.173/Sup3rS3cretPickl3Ingred.txt`, I finally got the first ingredient.

---

## Task 2: What is the second ingredient in Rick's potion?

Onto the second task. Investigating the source code of the portal website brought to my attention that a string encoded in base64 is hidden in the comments.

![Portal page source with a base64-encoded string hidden in an HTML comment](/posts/images/pickle-rick/twevelth.png)

This encoding was wrapped multiple times over and I had to decode each output. I hoped for a password, however I fell for a prank put there by the room creators and the final result ended up being "rabbit hole".

Going back to the portal.php page, I wanted to try more commands. Thinking back to clue.txt, I realized that the answer would be here, I just had to check around the entire file system.

If the command box follows SSH commands, then it would be wise to see where I am, so I did exactly that. Executing "pwd" brought me to:

![Output of pwd showing /var/www/html](/posts/images/pickle-rick/thirteenth.png)

However, trying any form of cd did not work whatsoever and I was redirected back to the same page with the first ingredient. So, if I could not be moved anywhere, maybe I could just see everything using "ls /".

![Output of ls / showing the root filesystem directories](/posts/images/pickle-rick/fourteenth.png)

A few interesting files here, but the home directory stuck out to me the most. Again, I could not use "cd" to move anywhere, but I could use "ls /home" to see:

![Output of ls /home showing rick and ubuntu](/posts/images/pickle-rick/fifteenth.png)

Another "ls /home/rick" took me to:

![Output of ls /home/rick showing the "second ingredients" file](/posts/images/pickle-rick/sixteenth.png)

"ls" would not take me further so I thought this file just had the password, but then "cat" would not take me further either. Stumped again, I looked into ways to read files. I finally stumbled upon a niche – at least to me – command called "less". Entering `less '/home/rick/second ingredients'` finally got me the second password.

![The second ingredient revealed via the less command](/posts/images/pickle-rick/seventeenth.png)

---

## Task 3: What is the last and final ingredient?

The last password. I decided to go back to the main directory page I got by using "ls /". Besides for the home directory, the root directory also struck out to me. However, trying "ls /root" did not yield any result. So I thought I did not have administrator privileges. Trying "sudo ls /root" finally took me to:

![Output of sudo ls /root showing 3rd.txt and snap](/posts/images/pickle-rick/eighteenth.png)

Just like the previous password, this one also was not accessible by using "sudo cat /root/3rd.txt" so I instead used the less command by doing `sudo less /root/3rd.txt` and that brought me to the third and final password.

![The third and final ingredient revealed](/posts/images/pickle-rick/nineteenth.png)

---

## Conclusion

Although the room was rated easy and had an estimated time of 30 minutes, I still took around 2 hours to complete it. I could make excuses on how it was actually pretty challenging and writing this report on the side padded the time. But at the end of the day, I still had to seek help on portions like using "gobuster" properly (I forgot to include `dir` during my first attempt) or on how to use "less" instead of "cat". My inexperience in doing challenges like these truly did show with the time I used. I hope to hone my skills further as I go on.

I hope my first CTF report was helpful to any who had the time and patience to go through it. I hope to catch you in any future ones I write.

Bye bye.

PS: I originally wrote all of this in Google Docs but then I had the idea of making my own website and putting it on there. But I after that I realized I needed a markdown file to upload to my website properly. My first attempt was by using every converter under the sun to convert docs to md but none of them looked good. So at the end, I ended up creating a new md file but had lost all the original screenshots, therefore making me screenshot everything from the original Google Docs. This is why a lot of the screenshots look weird, it definitely will look better from next time.
