export function gerarNumeroPedido(): string {
  const data = new Date();

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  const identificador = crypto.randomUUID()
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase();

  return `CG-${ano}${mes}${dia}-${identificador}`;
}

export function gerarChaveDemonstracao(): string {
  const grupos = [5, 5, 5];
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  
  return grupos
    .map((tamanho) => {
      const bytes = crypto.getRandomValues(
        new Uint8Array(tamanho)
      );

      return Array.from(
        bytes,
        (byte) => caracteres[byte % caracteres.length]
      ).join("");
    })
    .join("-");
}