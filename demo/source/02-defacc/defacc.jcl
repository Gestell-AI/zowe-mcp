//DEFACC   JOB ,,MSGLEVEL=(1,1),CLASS=A,MSGCLASS=X
//*
//* STEP 2: DEFINE ACCOUNTS DATASET WITH SELF-HEALING
//*
//***************************
//*  CLEANUP OLD CLUSTER   **
//***************************
//CLEANUP  EXEC PGM=IDCAMS
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
  DELETE DEMO.ACCOUNTS.CLUSTER CLUSTER PURGE
  SET MAXCC = 0
/*
//*
//***************************
//*  DEFINE ACCOUNTS       **
//***************************
//DEFACC   EXEC PGM=IDCAMS,COND=(8,LT)
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
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
//*  VERIFY CLUSTER        **
//***************************
//VERIFY   EXEC PGM=IDCAMS,COND=(8,LT)
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
  LISTCAT CLUSTER ENTRIES(DEMO.ACCOUNTS.CLUSTER) ALL
/*
//*
//***************************
//*  ERROR HANDLING        **
//***************************
//ERROR    EXEC PGM=IEFBR14,COND=ONLY
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
  ACCOUNTS CLUSTER DEFINITION FAILED - CHECK SYSPRINT
/*