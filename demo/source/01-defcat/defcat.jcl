//DEFCAT   JOB ,,MSGLEVEL=(1,1),CLASS=A,MSGCLASS=X
//*
//* STEP 1: DEFINE VSAM CATALOG WITH SELF-HEALING
//*
//***************************
//*  CLEANUP OLD CATALOG   **
//***************************
//CLEANUP  EXEC PGM=IDCAMS,COND=EVEN
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
  DELETE DEMO.VSAM.CATALOG USERCATALOG PURGE
  SET MAXCC = 0
/*
//*
//***************************
//*  DEFINE NEW CATALOG    **
//***************************
//DEFCAT   EXEC PGM=IDCAMS,COND=(8,LT)
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
  DEFINE USERCATALOG(                      -
    NAME(DEMO.VSAM.CATALOG)                -
    TRACKS(50 10)                          -
    ICFCATALOG                             -
  )
/*
//*
//***************************
//*  VERIFY CATALOG        **
//***************************
//VERIFY   EXEC PGM=IDCAMS,COND=(8,LT)
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
  LISTCAT USERCATALOG
  LISTCAT ENTRIES(DEMO.VSAM.CATALOG) ALL
/*
//*
//***************************
//*  ERROR HANDLING        **
//***************************
//ERROR    EXEC PGM=IEFBR14,COND=ONLY
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
  CATALOG DEFINITION FAILED - CHECK SYSPRINT
/*
//*
//***************************
//*  SUCCESS CONFIRMATION  **
//***************************
//SUCCESS  EXEC PGM=IEFBR14,COND=(8,LT)
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
  CATALOG DEFINITION SUCCESSFUL - READY FOR DATASET CREATION
/*