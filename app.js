import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCOWtLC5QW1f6e4E_PgX5ica1ZjJFf7dOA",
  authDomain: "hq-jesus-app.firebaseapp.com",
  projectId: "hq-jesus-app",
  storageBucket: "hq-jesus-app.firebasestorage.app",
  messagingSenderId: "891131802217",
  appId: "1:891131802217:web:acf1cb5f5b47df1acf28f8"
};

// SUA NOVA CHAVE DO AI STUDIO
const GEMINI_API_KEY = "AQ.Ab8RN6LA1f3v8qpiO2uAVdBecJbOHPEVge5UQTLFikTjSPmocA";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let capituloAtual = null;

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
        
        capitulos.sort((a, b) => a.id.localeCompare(b.id));
        const proximo = capitulos.find(cap => cap.status === "pendente");

        if (proximo) {
            capituloAtual = proximo; 
            painel.innerHTML = `Próximo na fila:<br><span class="destaque">${proximo.titulo}</span>`;
            btnGerar.style.display = 'block'; 
        } else {
            painel.innerHTML = "A HQ está finalizada! Todos os capítulos já foram gerados.";
        }
    } catch (erro) {
        painel.innerHTML = `<span style="color: red;">Erro ao tentar ler o banco de dados.</span>`;
    }
}

async function gerarRoteiroIA() {
    const painel = document.getElementById('painel-status');
    const btnGerar = document.getElementById('btn-gerar');
    
    painel.innerHTML = `Lendo a Bíblia e O Evangelho Segundo o Espiritismo para escrever: <br><span class="destaque">${capituloAtual.titulo}</span>... <br><br><small>(Isso pode levar cerca de 10 a 20 segundos)</small>`;
    btnGerar.style.display = 'none';

    const systemPrompt = `Você é um roteirista especialista em quadrinhos no estilo Seinen.
Sua tarefa é resgatar da sua base de conhecimento os relatos da Bíblia e as explicações do livro 'O Evangelho Segundo o Espiritismo' sobre o TEMA.
A linguagem deve ser épica, madura e atrativa para jovens.
Você DEVE retornar a resposta EXCLUSIVAMENTE em formato JSON válido, contendo "title", "pages", "panels", "imagePrompt" em inglês e os "dialogue".`;

    const userPrompt = `TEMA: ${capituloAtual.titulo}`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ parts: [{ text: userPrompt }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });

        const data = await response.json();
        
        // NOVO: Verifica se o Google recusou e imprime o erro exato na tela
        if (!response.ok) {
            console.error("Erro detalhado da API:", data);
            painel.innerHTML = `<span style="color: red; font-weight: bold;">Erro do Google AI:</span><br> ${data.error.message}`;
            btnGerar.style.display = 'block';
            return;
        }
        
        const roteiroJSON = data.candidates[0].content.parts[0].text;
        
        painel.innerHTML = `<span style="color: #4CAF50; font-weight: bold;">Roteiro Gerado com Sucesso!</span><br><br>
        <pre style="text-align: left; font-size: 12px; background: #111; padding: 15px; border-radius: 5px; overflow-x: auto; max-height: 300px; color: #0f0; border: 1px solid #333;">${roteiroJSON}</pre>`;

    } catch (erro) {
        console.error(erro);
        painel.innerHTML = `<span style="color: red;">Falha de conexão com a internet ou bloqueio do navegador.</span>`;
        btnGerar.style.display = 'block';
    }
}

document.getElementById('btn-proximo').addEventListener('click', buscarProximoCapitulo);
document.getElementById('btn-gerar').addEventListener('click', gerarRoteiroIA);