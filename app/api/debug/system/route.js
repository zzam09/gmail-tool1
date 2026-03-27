import { DebugHelper, quickTests } from "@/lib/debug-helper";

export const GET = DebugHelper.createDebugEndpoint('System Debug', async (req, { params }) => {
  const searchParams = new URL(req.url).searchParams;
  const testType = searchParams.get('test') || 'everything';
  
  switch (testType) {
    case 'everything':
      return Response.json(await quickTests.testEverything());
    
    case 'firstUser':
      return Response.json(await quickTests.testFirstUserWithTokens());
    
    case 'database':
      return Response.json(await DebugHelper.testDatabaseConnection());
    
    default:
      return Response.json({
        success: true,
        message: 'Available tests: everything, firstUser, database',
        example: 'Use ?test=everything to run all tests'
      });
  }
});
