---
title: Oh My Grub root-me
time: 2025-03-11
categories: [ctf]
tags: [forensics]
cover: /images/cover.jpeg
---


# Analyzing an OVA File to Retrieve Login Credentials

In this challenge, we are given an OVA (Open Virtualization Appliance) file. The goal is to analyze the file and retrieve the login credentials required to access the virtual machine. Here's how I approached the problem:

---

## Step 1: Extracting Files from the OVA File

The OVA file is essentially a tarball, so we can extract its contents using the `tar` command:

`tar -xvf root.ova`

After extraction, we get two files:

- `root-disk001.vmdk` (the virtual disk)
- `root.ovf` (the Open Virtualization Format file)

---
## Step 2: Converting the VMDK Disk to RAW Format

To analyze the virtual disk, I converted the `.vmdk` file to a raw disk image using `qemu-img`:

`qemu-img convert -f vmdk -O raw root-disk001.vmdk root.raw`

This gives us a `root.raw` file, which is easier to work with for further analysis.

---
## Step 3: Mapping Partitions with `kpartx`

Next, I used `kpartx` to map the partitions in the raw disk image:

`sudo kpartx -av root.raw`

This command maps the partitions to `/dev/mapper/loop0p1`, `/dev/mapper/loop0p2`, etc., depending on the disk's partition table.

---
## Step 4: Mounting the Partition

With the partitions mapped, I mounted the first partition (`/dev/mapper/loop0p1`) to `/mnt`:

`sudo mount /dev/mapper/loop0p1 /mnt`

Now, I had full access to the filesystem of the virtual machine.

---
## Step 5: Analyzing the Filesystem

### Checking `/etc/passwd` for User Credentials

My first step was to check the `/etc/passwd` file to see if I could extract or crack any user passwords:

`sudo cat /mnt/etc/passwd`


However, the passwords in `/etc/passwd` are typically hashed and stored in `/etc/shadow`, so this didn't yield any immediate results.

---

### Exploring the User Home Directory

Next, I checked the home directory of the user `root-me`:

`sudo ls -lah /mnt/home/root-me`

The output was:

```
total 20K
drwxr-xr-x 2 moza moza 4.0K Jul 16  2019 .
drwxr-xr-x 3 root root 4.0K Jul 16  2019 ..
-rw-r--r-- 1 moza moza  220 Jul 16  2019 .bash_logout
-rw-r--r-- 1 moza moza 3.5K Jul 16  2019 .bashrc
-rw-r--r-- 1 moza moza  675 Jul 16  2019 .profile
```

There was nothing particularly interesting here, so I moved on to the `root` user's directory.

---

### Investigating the Root Directory

In the `/root` directory, I found a file named `.password`:


`sudo ls -lah /mnt/root/`

The output was:

`-rw-r--r-- 1 moza moza  220 Jul 16  2019 .password`

---

## Step 6: Retrieving the Password

I opened the `.password` file to see its contents:


`sudo cat /mnt/root/.passwd`

The file contained the following message:

Bravo voici le flag :

F1aG-M3_PlEas3:)

Congratulation ! You may validate using this flag

F1aG-M3_PlEas3:)

---

## Conclusion

By extracting and analyzing the OVA file, I was able to retrieve the flag: `F1aG-M3_PlEas3:)`. This challenge was a great exercise in understanding virtual machine disk images and filesystem analysis.

---

**See you in the next challenge!** ❤️
