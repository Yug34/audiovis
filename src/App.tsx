import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Initialize WASM module
    (async () => {
      try {
        const { helloFromWasm, addInWasm } = await import('@/lib/wasm');
        const msg = await helloFromWasm();
        const sum = await addInWasm(2, 40);
        console.log('WASM initialized:', { msg, sum });
      } catch (err) {
        console.error('WASM init failed', err);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen">
      <main className="flex-1 relative">
        <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
          Hello World
        </div>
      </main>
    </div>
  );
}

export default App;
