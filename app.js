// Importações diretas (CDN) adaptadas para rodar sem instalação de pacotes
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// As suas chaves exatas do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCOWtLC5QW1f6e4E_PgX5ica1ZjJFf7dOA",
  authDomain: "hq-jesus-app.firebaseapp.com",
  projectId: "hq-jesus-app",
  storageBucket: "hq-jesus-app.firebasestorage.app",
  messagingSenderId: "891131802217",
  appId: "1:891131802217:web:acf1cb5f5b47df1acf28f8"
};

// Inicializando o Firebase e o Banco de Dados
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para buscar o próximo capítulo
async function buscarProximoCapitulo() {
    const painel = document.getElementById('painel-status');
    painel.innerHTML = "Conectando ao banco de dados e lendo cronologia...";

    try {
        // Acessa a coleção que você criou
        const cronologiaRef = collection(db, "cronologia");
        const querySnapshot = await getDocs(cronologiaRef);
        
        let capitulos = [];
        querySnapshot.forEach((doc) => {
            capitulos.push({ id: doc.id, ...doc.data() });
        });

        // Organiza em ordem (cap_01, cap_02, etc)
        capitulos.sort((a, b) => a.id.localeCompare(b.id));

        // Procura o primeiro que está como "pendente"
        const proximo = capitulos.find(cap => cap.status === "pendente");

        if (proximo) {
            painel.innerHTML = `O próximo passo da história é:<br><br> ID: ${proximo.id} <br> Título: <span class="destaque">${proximo.titulo}</span>`;
        } else {
            painel.innerHTML = "A HQ está finalizada! Todos os capítulos já foram gerados.";
        }

    } catch (erro) {
        console.error("Erro na conexão:", erro);
        painel.innerHTML = `<span style="color: red;">Erro ao tentar ler o banco de dados. (Verifique o console para mais detalhes).</span>`;
    }
}

// Configura o botão para rodar a função ao ser clicado
document.getElementById('btn-proximo').addEventListener('click', buscarProximoCapitulo);