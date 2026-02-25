import { showDialog } from '../js/comps/dialog.js'; // Adjust path

test('dialog smoke test', () => {
  document.body.innerHTML = '<div id="container"></div>';
  const d = showDialog({ title: 'test' });
  d.querySelector('button')?.click(); 
  expect(d).toBeDefined();
});