<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap fastq2fasta
        </h1>
        <h3 class="font-weight-light">Interleaves <Initialism>FASTQ</Initialism> files into a <Initialism>FASTA</Initialism> stream</h3>
        
        <v-divider class="my-2" />

        <p>
            The <Code>umgap fastq2fasta</Code> command takes one or more <Initialism>FASTQ</Initialism> files and interleaves them into a 
            single <Initialism>FASTA</Initialism> file.
        </p>

        <HeaderBodyCard id="usage" title="Usage">
            <p>
                The <Initialism>FASTQ</Initialism> input files are given as command line arguments. In order, a single record is taken 
                from each of these files, and the record header and sequence are written to <i>standard output</i> in <Initialism>FASTA</Initialism> 
                format, dropping the quality scores, until any of the files runs out or records.
            </p>

            <p>
                This command is generally used to combine two paired-end <Initialism>FASTQ</Initialism> files into a single 
                <Initialism>FASTA</Initialism> file.
            </p>

            <Boxed style="max-height: fit-content">
                <Sentinel>$</Sentinel> <b>cat input_1.fq</b>
                <br>@record1/1
                <br>GATAGCCGTCGAGCGTCCCGACATCCATATACAGCTCGCCGCAGTGCGTCGCCCGCACGGCATCGCGCGCCGCGATGTACGCATTCAACCAGCGTCCGAG
                <br>+
                <br>AADGGGG&lt;GI@IIKJKKKKH4EIJCHJ9:IJHKIKDIKDKGDJD@C@&lt;>KD=;FEA:DA=I$EEED$>C@1EDE?D:CEAC;CDE:E$D$=D$EAD?AEE
                <br>@record2/1
                <br>CCCAGGTCCCCGGCATCGTCGCGGCCTCGCCCATGATCCAGCTCCACGACCAGATCCCCGTTCCCGGCGGTAAAGAGCGCGGCGTGCTCATCCTCGGAGT
                <br>+
                <br>ADDEEG@GIGIIHKCJKH@HHGKHHKHKKJJBA.GFIGK(IHKKEKECBEEEEDIKC@H&lt;EDBJDEA36;6EE$E:G6C=E$E@CE?EE9FEE?E:F$?$
                <br><Sentinel>$</Sentinel> <b>cat input_2.fq</b>
                <br>@record1/2
                <br>CATTGTTCGCTACTTTGCGGAGCGCAATTATGCCGCGGAGATCTTCTACGTGGTGCAGCAGAAGCTGGCGGGCTGGTGCGATGCGTTGTATCGGCCCGAG
                <br>+
                <br>DDDEGGG?HIHIIKHK?@2KBHGDCJKI(JEJJKKHKKHBHKKFICEICECCFFEICCCC$E6ED$?CEEDDED$DEDCFFECEEEEFB$CCEC$6C=CA
                <br>@record2/2
                <br>GGACACGCTCTCAGGACGATGGCGCGATTGCAGGACTTGCTGGATCTCCTCCGTCGCCAAGGGGACGCGCTCGGAGTGGCTCATGGAGCAGACGAGTTCT
                <br>+
                <br>AADGGGEGIIIHIJKGCK&lt;KD:KKHI?HIHHJKFJEKKJIGE$CKHE$EE$FEEEI=EAE8EAIKFBEE$EADEEDB$DEEDE=?B6C$C$6$A$$=BEE
                <br><Sentinel>$</Sentinel> <b>umgap fastq2fasta input_1.fq input_2.fq</b>
                <br>>record1/1
                <br>GATAGCCGTCGAGCGTCCCGACATCCATATACAGCTCGCCGCAGTGCGTCGCCCGCACGGCATCGCGCGCCGCGATGTACGCATTCAACCAGCGTCCGAG
                <br>>record1/2
                <br>CATTGTTCGCTACTTTGCGGAGCGCAATTATGCCGCGGAGATCTTCTACGTGGTGCAGCAGAAGCTGGCGGGCTGGTGCGATGCGTTGTATCGGCCCGAG
                <br>>record2/1
                <br>CCCAGGTCCCCGGCATCGTCGCGGCCTCGCCCATGATCCAGCTCCACGACCAGATCCCCGTTCCCGGCGGTAAAGAGCGCGGCGTGCTCATCCTCGGAGT
                <br>>record2/2
                <br>GGACACGCTCTCAGGACGATGGCGCGATTGCAGGACTTGCTGGATCTCCTCCGTCGCCAAGGGGACGCGCTCGGAGTGGCTCATGGAGCAGACGAGTTCT
            </Boxed>
        </HeaderBodyCard>
    </v-container>
</template>

<script setup lang="ts">
import Code from '@/components/highlights/InlineCode.vue';
import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import Initialism from '@/components/highlights/Initialism.vue';
import Boxed from '@/components/highlights/Boxed.vue';
import Sentinel from '@/components/highlights/Sentinel.vue';
</script>
