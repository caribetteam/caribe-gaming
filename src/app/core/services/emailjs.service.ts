import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

export interface JogoComChaves {
  id?: number | string;
  nome: string;
  preco: number;
  quantidade?: number;
  imagemUrl?: string;
  plataforma?: string;
  categoria?: string;
  chaves: string[];
}

export interface PedidoEmail {
  email: string;
  numeroPedido: string;
  jogos: JogoComChaves[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class EmailjsService {

  private readonly publicKey = 'SJ7fRomeF6igl2gyU';
  private readonly serviceID = 'service_ij3hedm';
  private readonly templateID = 'template_xyug9nx';

  private escaparHTML(valor: string): string {
    return valor.replace(/[&<>"']/g, (caractere) => {
      const entidades: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };

      return entidades[caractere];
    });
  }

  private gerarBlocoJogos(jogos: JogoComChaves[]): string {
    return jogos.map((jogo) => {
      let imagem = jogo.imagemUrl ?? ""
      
      const nome = this.escaparHTML(jogo.nome);
      imagem = this.escaparHTML(imagem);

      const chavesHTML = jogo.chaves.map((chave, indice) => `
        <p style="margin: 0 0 8px; color: #F1F5F4;">
          Chave ${jogo.chaves.length > 1 ? indice + 1 : ''}:
          <strong style="color: #72ecff;">
            ${this.escaparHTML(chave)}
          </strong>
        </p>
      `).join('');
        
      const quantidade = jogo.quantidade ?? 1;

      return `
        <div style="
          background-color: #0b1c30;
          border: 1px solid #234A67;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-family: Arial, sans-serif;
        ">
          <table width="100%" cellpadding="0" cellspacing="0"
            style="border-collapse: collapse;">
            <tr>
              <td width="38%" valign="top" style="padding-right: 15px;">
                <img src="${imagem}" alt="${nome}"
                style="
                    width: 100%;
                    max-width: 180px;
                    height: 180px;
                    object-fit: cover;
                    object-position: center;
                    display: block;
                    border-radius: 6px;
                ">
              </td>

              <td valign="top">
                <h2 style="
                  margin: 0 0 12px;
                  color: #F1F5F4;
                  font-size: 20px;
                ">${nome}</h2>

                ${chavesHTML}

                <p style="color: #F1F5F4;">
                  Quantidade:
                  <strong style="color: #72ecff;">
                    ${jogo.quantidade}
                  </strong>
                </p>

                <p style="
                  margin-top: 20px;
                  text-align: right;
                  color: #72ecff;
                  font-size: 20px;
                  font-weight: bold;
                ">
                  R$ ${(jogo.preco * quantidade)
                    .toFixed(2).replace('.', ',')}
                </p>
              </td>
            </tr>
          </table>
        </div>
      `;
    }).join('');
  }

  async enviarPedido(pedido: PedidoEmail): Promise<void> {

    if (!pedido.email || !pedido.jogos.length) {
      throw new Error('Dados do pedido incompletos.');
    }

    for (const jogo of pedido.jogos) {
      if (
        jogo.chaves.length !== jogo.quantidade ||
        jogo.chaves.some(chave => !chave.trim())
      ) {
        throw new Error(`Chaves incompletas para ${jogo.nome}.`);
      }
    }

    const parametros = {
      email_cliente: pedido.email,
      order_number: pedido.numeroPedido,
      bloco_jogo: this.gerarBlocoJogos(pedido.jogos),
      Total: `R$ ${pedido.total.toFixed(2).replace('.', ',')}`,
    };

    await emailjs.send(
      this.serviceID,
      this.templateID,
      parametros,
      { publicKey: this.publicKey }
    );
  }
}