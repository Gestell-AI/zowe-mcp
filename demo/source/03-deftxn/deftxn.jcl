//DEFTXN   JOB ,,MSGLEVEL=(1,1),CLASS=A,MSGCLASS=X
//*
//* STEP 3: DEFINE TRANSACTION DATASET WITH SELF-HEALING
//*
//***************************
//*  CLEANUP OLD CLUSTER   **
//***************************
//CLEANUP  EXEC PGM=IDCAMS
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
  DELETE DEMO.TXN.CLUSTER CLUSTER PURGE
  SET MAXCC = 0
/*
//*
//***************************
//*  DEFINE TRANSACTIONS   **
//***************************
//DEFTXN   EXEC PGM=IDCAMS,COND=(8,LT)
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
  DEFINE CLUSTER(                          -
    NAME(DEMO.TXN.CLUSTER)                 -
    TRACKS(2000 500)                       -
    KEYS(12 0)                             -
    RECORDSIZE(200 200)                    -
    CISZ(8192)                             -
    FREESPACE(5 15)                        -
    INDEXED                                -
    REUSE                                  -
    SPEED                                  -
    EATTR(OPT)                             -
  )                                        -
  DATA(                                    -
    NAME(DEMO.TXN.DATA)                    -
    CONTROLINTERVALSIZE(8192)              -
  )                                        -
  INDEX(                                   -
    NAME(DEMO.TXN.INDEX)                   -
    CONTROLINTERVALSIZE(2048)              -
  )
/*
//*
//***************************
//*  VERIFY CLUSTER        **
//***************************
//VERIFY   EXEC PGM=IDCAMS,COND=(8,LT)
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
  LISTCAT CLUSTER ENTRIES(DEMO.TXN.CLUSTER) ALL
/*
//*
//***************************
//*  ERROR HANDLING        **
//***************************
//ERROR    EXEC PGM=IEFBR14,COND=ONLY
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
  TRANSACTION CLUSTER DEFINITION FAILED - CHECK SYSPRINT
/*