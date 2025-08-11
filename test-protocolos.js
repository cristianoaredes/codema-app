// Simple test to check if the page loads correctly
// Using Node.js built-in fetch (available in Node 18+)

async function testProtocolosPage() {
  console.log('Testing protocolos page...\n');
  
  try {
    // Test 1: Check if page responds
    const response = await fetch('http://localhost:8080/codema/protocolos');
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    
    const html = await response.text();
    console.log(`Response size: ${html.length} bytes`);
    
    // Test 2: Check for basic HTML structure
    const hasRoot = html.includes('id="root"');
    const hasScript = html.includes('<script');
    const hasBody = html.includes('<body>');
    
    console.log('\nHTML Structure:');
    console.log(`- Has root div: ${hasRoot}`);
    console.log(`- Has script tags: ${hasScript}`);
    console.log(`- Has body tag: ${hasBody}`);
    
    // Test 3: Check for error messages
    const hasError = html.toLowerCase().includes('error');
    const has404 = html.includes('404');
    
    console.log('\nError Check:');
    console.log(`- Contains 'error': ${hasError}`);
    console.log(`- Contains '404': ${has404}`);
    
    // Test 4: Extract title if present
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    if (titleMatch) {
      console.log(`\nPage title: "${titleMatch[1]}"`);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testProtocolosPage();