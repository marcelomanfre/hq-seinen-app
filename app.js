import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// Configuração do Banco de Dados (Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyCOWtLC5QW1f6e4E_PgX5ica1ZjJFf7dOA",
  authDomain: "hq-jesus-app.firebaseapp.com",
  projectId: "hq-jesus-app",
  storageBucket: "hq-jesus-app.firebasestorage.app",
  messagingSenderId: "891131802217",
  appId: "1:891131802217:web:acf1cb5f5b47df1acf28f8"
};

// Configuração do Cérebro (Google AI Studio)
const GEMINI_API_KEY = "AQ.Ab8RN6JZsRULl_-3u51odlUl_aUnEUMEKNtn1EqxwalD1n7cqQ"; 

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Variável global para guardar qual capítulo estamos fazendo
let capituloAtual = null;

// Função 1: LER O BANCO DE DADOS
async function buscarProximoCapitulo() {
    const painel = document.getElementById('painel-status');
    const btnGerar = document.getElementById('btn-gerar');
    painel.innerHTML = "Conectando ao banco de dados e lendo cronologia...";
    btnGerar.style.display = 'none';

    try {
        const cronologiaRef = collection(db, "cronologia");
        const querySnapshot = await getDocs(cronologiaRef);
        
        let capitulos = [];
        querySnapshot.forEach((doc) => { capitulos.push({ id: doc.id, ...doc.data() }); });
        
        // Organiza em ordem (cap_01, cap_02, etc)
        capitulos.sort((a, b) => a.id.localeCompare(b.id));

        // Procura o primeiro que está como "pendente"
        const proximo = capitulos.find(cap => cap.status === "pendente");

        if (proximo) {
            capituloAtual = proximo; // Guarda o capítulo na memória
            painel.innerHTML = `Próximo na fila:<br><span class="destaque">${proximo.titulo}</span>`;
            btnGerar.style.display = 'block'; // Mostra o botão verde
        } else {
            painel.innerHTML = "A HQ está finalizada! Todos os capítulos já foram gerados.";
        }
    } catch (erro) {
        console.error("Erro na conexão:", erro);
        painel.innerHTML = `<span style="color: red;">Erro ao tentar ler o banco de dados. Verifique o console.</span>`;
    }
}

// Função 2: CRIAR O ROTEIRO COM INTELIGÊNCIA ARTIFICIAL
async function gerarRoteiroIA() {
    const painel = document.getElementById('painel-status');
    const btnGerar = document.getElementById('btn-gerar');
    
    painel.innerHTML = `Lendo a Bíblia e O Evangelho Segundo o Espiritismo para escrever: <br><span class="destaque">${capituloAtual.titulo}</span>... <br><br><small>(Isso pode levar cerca de 10 a 20 segundos)</small>`;
    btnGerar.style.display = 'none';

    // O comando mestre de comportamento
    const systemPrompt = `Você é um roteirista especialista em quadrinhos no estilo Seinen.
Sua tarefa é resgatar da sua base de conhecimento os relatos da Bíblia e as explicações do livro 'O Evangelho Segundo o Espiritismo' sobre o TEMA.
A linguagem deve ser épica, madura e atrativa para jovens, sem termos chulos.
Você DEVE retornar a resposta EXCLUSIVAMENTE em formato JSON válido, contendo "title", "pages", "panels", "imagePrompt" em inglês (focado em iluminação e estilo ink art seinen) e os "dialogue".`;

    const userPrompt = `TEMA: ${capituloAtual.titulo}`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ parts: [{ text: userPrompt }] }],
                generationConfig: { response_mime_type: "application/json" } // Força o JSON puro
            })
        });

        const data = await response.json();
        
        // Extrai o texto da resposta
        const roteiroJSON = data.candidates[0].content.parts[0].text;
        
        // Exibe o JSON gerado formatado na tela
        painel.innerHTML = `<span style="color: #4CAF50; font-weight: bold;">Roteiro Gerado com Sucesso!</span><br><br>
        <pre style="text-align: left; font-size: 12px; background: #111; padding: 15px; border-radius: 5px; overflow-x: auto; max-height: 300px; color: #0f0; border: 1px solid #333;">${roteiroJSON}</pre>`;

    } catch (erro) {
        console.error(erro);
        painel.innerHTML = `<span style="color: red;">Falha ao gerar o roteiro com a IA. Tente novamente.</span>`;
        btnGerar.style.display = 'block';
    }
}

// Configura os cliques dos botões
document.getElementById('btn-proximo').addEventListener('click', buscarProximoCapitulo);
document.getElementById('btn-gerar').addEventListener('click', gerarRoteiroIA);