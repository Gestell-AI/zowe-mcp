//CREATEAC JOB ,NOTIFY=&SYSUID,
//  MSGLEVEL=(1,1),CLASS=A,MSGCLASS=X,TIME=(,4),REGION=144M
//*
//* STEP 6: CREATE INITIAL ACCOUNT DATA WITH SELF-HEALING
//*
//***************************
//*  CLEANUP EXISTING DATA **
//***************************
//CLEANUP  EXEC PGM=IDCAMS
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
  DELETE DEMO.ACCOUNTS.CLUSTER CLUSTER PURGE
  SET MAXCC = 0
  DEFINE CLUSTER(                          -
    NAME(DEMO.ACCOUNTS.CLUSTER)            -
    TRACKS(500 100)                        -
    KEYS(10 0)                             -
    RECORDSIZE(200 200)                    -
    CISZ(4096)                             -
    FREESPACE(10 20)                       -
    INDEXED                                -
    REUSE                                  -
    SPEED                                  -
    EATTR(OPT)                             -
  )                                        -
  DATA(                                    -
    NAME(DEMO.ACCOUNTS.DATA)               -
    CONTROLINTERVALSIZE(4096)              -
  )                                        -
  INDEX(                                   -
    NAME(DEMO.ACCOUNTS.INDEX)              -
    CONTROLINTERVALSIZE(1024)              -
  )
/*
//*
//***************************
//*  CREATE ACCOUNT DATA   **
//***************************
//CREATEAC EXEC PGM=IDCAMS,COND=(8,LT)
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
  REPRO INFILE(ACCTDATA) OUTFILE(ACCOUNTS) -
        REPLACE
/*
//ACCTDATA DD *
00001     JOHN SMITH                              00001000000001000000
00002     JANE DOE                                00001000000001000000
00003     BOB JOHNSON                             00001000000001000000
00004     ALICE BROWN                             00001000000001000000
00005     CHARLIE WILSON                          00001000000001000000
//ACCOUNTS DD DSN=DEMO.ACCOUNTS.CLUSTER,DISP=SHR
//*
//***************************
//*  VERIFY ACCOUNT DATA   **
//***************************
//VERIFY   EXEC PGM=IDCAMS,COND=(8,LT)
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
  LISTCAT ENTRIES(DEMO.ACCOUNTS.CLUSTER) ALL
  VERIFY DATASET(DEMO.ACCOUNTS.CLUSTER)
  EXAMINE NAME(DEMO.ACCOUNTS.CLUSTER) -
          INDEXTEST DATATEST -
          ERRORLIMIT(50)
  PRINT INFILE(ACCOUNTS) COUNT(10)
/*
//ACCOUNTS DD DSN=DEMO.ACCOUNTS.CLUSTER,DISP=SHR
//*
//***************************
//*  SUCCESS CONFIRMATION  **
//***************************
//SUCCESS  EXEC PGM=IEFBR14,COND=(8,LT)
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
  ACCOUNT DATA CREATION SUCCESSFUL - 5 RECORDS LOADED
/*
//*
//***************************
//*  ERROR HANDLING        **
//***************************
//ERROR    EXEC PGM=IEFBR14,COND=ONLY
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
  ACCOUNT DATA CREATION FAILED - CHECK SYSPRINT
/*