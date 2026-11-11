-- AlterTable
ALTER TABLE "Contest" ADD COLUMN     "codeGenerationSeedHash" CHAR(64),
ADD COLUMN     "codePoolFingerprint" CHAR(64),
ADD COLUMN     "codesGeneratedAt" TIMESTAMP(3);
