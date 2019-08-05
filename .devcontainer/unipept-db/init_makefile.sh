#!/usr/bin/expect -f

set timeout -1

spawn ./configure
expect "What is the minimum length (inclusive) for tryptic peptides? [5]\r"
send -- "5\r"
