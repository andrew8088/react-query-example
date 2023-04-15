import './App.css';
import { useGetGadgets, useGetOrCreateProduct, useGetWidgets } from './hooks';

function App() {
  useGetGadgets();
  useGetWidgets();

  const { mutate: getProduct, data: product } = useGetOrCreateProduct();

  return (
    <div className="App">
      <h1>{product ? product.id : "no id yet"}</h1>

      <button onClick={() => getProduct("w1")}>W1</button>
      <button onClick={() => getProduct("g3")}>G3</button>
      <button onClick={() => getProduct("w5")}>W5</button>
      <button onClick={() => getProduct("g5")}>G5</button>
    </div>
  );
}

export default App;
