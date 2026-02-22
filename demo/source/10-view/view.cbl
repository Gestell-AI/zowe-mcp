       IDENTIFICATION DIVISION.
       PROGRAM-ID. VIEW.
       AUTHOR. VSAM WORKFLOW SYSTEM.
       DATE-WRITTEN. TODAY.
      
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT ACCOUNT-FILE ASSIGN TO CUSTFILE
               ORGANIZATION IS INDEXED
               ACCESS MODE IS SEQUENTIAL
               RECORD KEY IS CUST-KEY
               FILE STATUS IS ACCT-STATUS.
               
           SELECT TRANSACTION-FILE ASSIGN TO TXNDATA
               ORGANIZATION IS INDEXED
               ACCESS MODE IS SEQUENTIAL
               RECORD KEY IS TXN-ID
               FILE STATUS IS TXN-FILE-STATUS.
               
           SELECT REPORT-FILE ASSIGN TO VIEWRPT
               ORGANIZATION IS SEQUENTIAL
               ACCESS MODE IS SEQUENTIAL
               FILE STATUS IS RPT-STATUS.

       DATA DIVISION.
       FILE SECTION.
       FD  ACCOUNT-FILE
           RECORD CONTAINS 200 CHARACTERS.
       COPY CUSTCOPY.

       FD  TRANSACTION-FILE
           RECORD CONTAINS 200 CHARACTERS.
       COPY TXNCOPY.

       FD  REPORT-FILE.
       01  REPORT-RECORD               PIC X(132).

       WORKING-STORAGE SECTION.
       01  FILE-STATUS-CODES.
           05  ACCT-STATUS             PIC XX.
           05  TXN-FILE-STATUS         PIC XX.
           05  RPT-STATUS              PIC XX.
           
       01  COUNTERS.
           05  ACCOUNT-COUNT           PIC 9(6) VALUE 0.
           05  TRANSACTION-COUNT       PIC 9(6) VALUE 0.
           05  LINE-COUNT              PIC 9(3) VALUE 0.
           
       01  DISPLAY-FIELDS.
           05  DISP-BALANCE            PIC Z,ZZZ,ZZ9.99-.
           05  DISP-AMOUNT             PIC Z,ZZZ,Z99.99-.
           
       01  REPORT-LINES.
           05  HEADER-LINE-1.
               10  FILLER              PIC X(40) VALUE SPACES.
               10  FILLER              PIC X(25) 
                   VALUE 'VSAM ACCOUNT AND TXN RPT'.
               10  FILLER              PIC X(67) VALUE SPACES.
               
           05  HEADER-LINE-2.
               10  FILLER              PIC X(45) VALUE SPACES.
               10  FILLER              PIC X(20) VALUE 'ACCOUNT BALANCES'.
               10  FILLER              PIC X(67) VALUE SPACES.
               
           05  ACCT-HEADER.
               10  FILLER              PIC X(10) VALUE 'ACCOUNT ID'.
               10  FILLER              PIC X(5)  VALUE SPACES.
               10  FILLER              PIC X(15) VALUE 'ACCOUNT NAME'.
               10  FILLER              PIC X(20) VALUE SPACES.
               10  FILLER              PIC X(15) VALUE 'CURRENT BALANCE'.
               10  FILLER              PIC X(5)  VALUE SPACES.
               10  FILLER              PIC X(12) VALUE 'LAST UPDATE'.
               10  FILLER              PIC X(50) VALUE SPACES.
               
           05  ACCT-DETAIL.
               10  AD-ACCT-ID          PIC X(10).
               10  FILLER              PIC X(5)  VALUE SPACES.
               10  AD-ACCT-NAME        PIC X(35).
               10  AD-BALANCE          PIC X(15).
               10  FILLER              PIC X(5)  VALUE SPACES.
               10  AD-LAST-UPDATE      PIC X(10).
               10  FILLER              PIC X(52) VALUE SPACES.
               
           05  TXN-HEADER.
               10  FILLER              PIC X(45) VALUE SPACES.
               10  FILLER              PIC X(15) VALUE 'TXN HISTORY'.
               10  FILLER              PIC X(72) VALUE SPACES.
               
           05  TXN-DETAIL.
               10  TD-ACCT-ID          PIC X(10).
               10  FILLER              PIC X(2)  VALUE SPACES.
               10  TD-TXN-TYPE         PIC X(8).
               10  FILLER              PIC X(3)  VALUE SPACES.
               10  TD-AMOUNT           PIC X(15).
               10  FILLER              PIC X(3)  VALUE SPACES.
               10  TD-DATE             PIC X(10).
               10  FILLER              PIC X(3)  VALUE SPACES.
               10  TD-DESCRIPTION      PIC X(30).
               10  FILLER              PIC X(46) VALUE SPACES.

       PROCEDURE DIVISION.
       MAIN-PROCESSING.
           PERFORM INITIALIZATION
           PERFORM PROCESS-ACCOUNTS
           PERFORM PROCESS-TRANSACTIONS
           PERFORM TERMINATION
           STOP RUN.

       INITIALIZATION.
           OPEN INPUT ACCOUNT-FILE
           OPEN INPUT TRANSACTION-FILE
           OPEN OUTPUT REPORT-FILE
           
           IF ACCT-STATUS NOT = '00'
              DISPLAY 'ERROR OPENING ACCOUNT FILE: ' ACCT-STATUS
              STOP RUN
           END-IF
           
           IF TXN-FILE-STATUS NOT = '00'
              DISPLAY 'ERROR OPENING TRANSACTION FILE: ' TXN-FILE-STATUS
              STOP RUN
           END-IF
           
           IF RPT-STATUS NOT = '00'
              DISPLAY 'ERROR OPENING REPORT FILE: ' RPT-STATUS
              STOP RUN
           END-IF
           
           PERFORM WRITE-HEADERS.

       PROCESS-ACCOUNTS.
           MOVE ACCT-HEADER TO REPORT-RECORD
           WRITE REPORT-RECORD
           MOVE SPACES TO REPORT-RECORD
           WRITE REPORT-RECORD
           
           PERFORM READ-ACCOUNT
           PERFORM UNTIL ACCT-STATUS = '10'
               ADD 1 TO ACCOUNT-COUNT
               PERFORM FORMAT-ACCOUNT-LINE
               PERFORM READ-ACCOUNT
           END-PERFORM
           
           MOVE SPACES TO REPORT-RECORD
           WRITE REPORT-RECORD
           MOVE SPACES TO REPORT-RECORD
           WRITE REPORT-RECORD.

       PROCESS-TRANSACTIONS.
           MOVE TXN-HEADER TO REPORT-RECORD
           WRITE REPORT-RECORD
           MOVE SPACES TO REPORT-RECORD
           WRITE REPORT-RECORD
           
           PERFORM READ-TRANSACTION
           PERFORM UNTIL TXN-FILE-STATUS = '10'
               ADD 1 TO TRANSACTION-COUNT
               PERFORM FORMAT-TRANSACTION-LINE
               PERFORM READ-TRANSACTION
           END-PERFORM.

       READ-ACCOUNT.
           READ ACCOUNT-FILE
           IF ACCT-STATUS NOT = '00' AND ACCT-STATUS NOT = '10'
              DISPLAY 'ERROR READING ACCOUNT FILE: ' ACCT-STATUS
           END-IF.

       READ-TRANSACTION.
           READ TRANSACTION-FILE
           IF TXN-FILE-STATUS NOT = '00' AND TXN-FILE-STATUS NOT = '10'
              DISPLAY 'ERROR READING TRANSACTION FILE: ' TXN-FILE-STATUS
           END-IF.

       FORMAT-ACCOUNT-LINE.
           MOVE CUST-KEY TO AD-ACCT-ID
           MOVE CUST-NAME TO AD-ACCT-NAME
           MOVE CUST-ACCT-BALANCE TO DISP-BALANCE
           MOVE DISP-BALANCE TO AD-BALANCE
           MOVE CUST-LAST-UPDATE TO AD-LAST-UPDATE
           MOVE ACCT-DETAIL TO REPORT-RECORD
           WRITE REPORT-RECORD.

       FORMAT-TRANSACTION-LINE.
           MOVE FROM-ACCOUNT TO TD-ACCT-ID
           MOVE TXN-TYPE TO TD-TXN-TYPE
           MOVE TXN-AMOUNT TO DISP-AMOUNT
           MOVE DISP-AMOUNT TO TD-AMOUNT
           MOVE TXN-DATE TO TD-DATE
           MOVE TXN-DESCRIPTION TO TD-DESCRIPTION
           MOVE TXN-DETAIL TO REPORT-RECORD
           WRITE REPORT-RECORD.

       WRITE-HEADERS.
           MOVE HEADER-LINE-1 TO REPORT-RECORD
           WRITE REPORT-RECORD
           MOVE SPACES TO REPORT-RECORD
           WRITE REPORT-RECORD
           MOVE HEADER-LINE-2 TO REPORT-RECORD
           WRITE REPORT-RECORD
           MOVE SPACES TO REPORT-RECORD
           WRITE REPORT-RECORD.

       TERMINATION.
           DISPLAY 'ACCOUNTS PROCESSED: ' ACCOUNT-COUNT
           DISPLAY 'TRANSACTIONS PROCESSED: ' TRANSACTION-COUNT
           
           CLOSE ACCOUNT-FILE
           CLOSE TRANSACTION-FILE
           CLOSE REPORT-FILE.