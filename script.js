/* =============================
   CONFIGURAÇÕES DO PIX
============================= */
const PIX_CHAVE = "20722447736";
const PIX_NOME = "BIANKA";
const PIX_CIDADE = "RIODEJANEIRO";

/* =============================
   CARRINHO
============================= */
let carrinho = [];

/* =============================
   FUNÇÕES DO CARRINHO
============================= */
function adicionarCarrinho(nome, valor) {
    carrinho.push({ nome, valor });
    atualizarCarrinho();
}

function removerItem(index) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
}

function toggleCarrinho() {
    document.getElementById("cart-drawer").classList.toggle("open");
}

/* =============================
   ATUALIZA UI
============================= */
function atualizarCarrinho() {
    const lista = document.getElementById("cart-items");
    const totalSpan = document.getElementById("cart-total");
    const badge = document.getElementById("cart-count");

    lista.innerHTML = "";
    let total = 0;

    carrinho.forEach((item, index) => {
        total += item.valor;

        const li = document.createElement("li");
        li.innerHTML = `
            <span>${item.nome} - R$ ${item.valor}</span>
            <button onclick="removerItem(${index})">❌</button>
        `;
        lista.appendChild(li);
    });

    totalSpan.textContent = total.toFixed(2);

    if (carrinho.length > 0) {
        badge.textContent = carrinho.length;
        badge.style.display = "flex";
    } else {
        badge.style.display = "none";
    }
}

/* =============================
   FINALIZAR PIX
============================= */
function finalizarPix() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio 💙");
        return;
    }

    const total = carrinho.reduce((s, i) => s + i.valor, 0);
    const pixCode = gerarPix(total);

    mostrarPix(pixCode);
}

/* =============================
   GERADOR PIX (EMV)
============================= */
function gerarPix(valor) {
    function campo(id, valor) {
        return id + valor.length.toString().padStart(2, "0") + valor;
    }

    function crc16(payload) {
        let polinomio = 0x1021;
        let resultado = 0xFFFF;

        for (let i = 0; i < payload.length; i++) {
            resultado ^= payload.charCodeAt(i) << 8;
            for (let j = 0; j < 8; j++) {
                resultado = (resultado & 0x8000)
                    ? (resultado << 1) ^ polinomio
                    : resultado << 1;
                resultado &= 0xFFFF;
            }
        }
        return resultado.toString(16).toUpperCase().padStart(4, "0");
    }

    const valorFormatado = valor.toFixed(2);

    let payload =
        campo("00", "01") +
        campo("26",
            campo("00", "BR.GOV.BCB.PIX") +
            campo("01", PIX_CHAVE)
        ) +
        campo("52", "0000") +
        campo("53", "986") +
        campo("54", valorFormatado) +
        campo("58", "BR") +
        campo("59", PIX_NOME.substring(0, 25)) +
        campo("60", PIX_CIDADE.substring(0, 15)) +
        campo("62", campo("05", "CASAMENTO"));

    payload += "6304";
    payload += crc16(payload);

    return payload;
}

/* =============================
   MOSTRAR QR + COPIA E COLA
============================= */
function mostrarPix(codigoPix) {

    const drawer = document.getElementById("cart-drawer");

    drawer.innerHTML = `
        <h2>Pix 💙</h2>

        <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(codigoPix)}"
            alt="QR Code Pix"
            style="margin:20px auto; display:block;"
        >

        <p style="word-break: break-all; font-size:12px;">
            ${codigoPix}
        </p>

        <button onclick="copiarPix('${codigoPix}')" class="pix-button">
            Copiar código Pix
        </button>

        <button onclick="location.reload()" style="margin-top:10px;">
            Voltar
        </button>
    `;
}

/* =============================
   COPIAR PIX
============================= */
function copiarPix(texto) {
    navigator.clipboard.writeText(texto);
    alert("Código Pix copiado 💙");
}
