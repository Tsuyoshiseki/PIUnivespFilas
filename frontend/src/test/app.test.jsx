import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";

function renderizar(rota = "/") {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );
}

async function preencherEEnviar(user, { nome, tipo, preferencial = false }) {
  await user.type(await screen.findByLabelText("Seu nome"), nome);
  await screen.findByRole("option", { name: tipo });
  await user.selectOptions(screen.getByLabelText("Tipo de atendimento"), tipo);
  if (preferencial) await user.click(screen.getByLabelText("Atendimento preferencial"));
  await user.click(screen.getByRole("button", { name: "Entrar na fila" }));
}

async function logar(user, email, senha) {
  await user.type(screen.getByLabelText("E-mail"), email);
  await user.type(screen.getByLabelText("Senha"), senha);
  await user.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("Estrutura e acessibilidade", () => {
  it("a página inicial tem um único h1 e os links principais", () => {
    renderizar("/");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Fila Virtual");
    // o item do menu e o botão grande levam ao mesmo destino
    const links = screen.getAllByRole("link", { name: "Entrar na fila" });
    expect(links).toHaveLength(2);
    links.forEach((l) => expect(l).toHaveAttribute("href", "/entrar"));
  });

  it("existe um link para pular ao conteúdo, apontando para o <main>", () => {
    renderizar("/");
    const pular = screen.getByRole("link", { name: "Pular para o conteúdo" });
    expect(pular).toHaveAttribute("href", "#conteudo");
    expect(screen.getByRole("main")).toHaveAttribute("id", "conteudo");
  });

  it("a navegação principal é identificada por rótulo", () => {
    renderizar("/");
    expect(screen.getByRole("navigation", { name: "Principal" })).toBeInTheDocument();
  });

  it("o título da aba muda conforme a página", async () => {
    renderizar("/entrar");
    expect(document.title).toBe("Entrar na fila – Fila Virtual");
  });

  it("página inexistente mostra aviso amigável", () => {
    renderizar("/qualquer-coisa");
    expect(screen.getByRole("heading", { name: "Página não encontrada" })).toBeInTheDocument();
  });
});

describe("Entrar na fila (cliente, sem login)", () => {
  it("campos têm rótulos associados", async () => {
    renderizar("/entrar");
    expect(await screen.findByLabelText("Seu nome")).toBeInTheDocument();
    expect(screen.getByLabelText("Tipo de atendimento")).toBeInTheDocument();
  });

  it("nome vazio mostra erro e não envia", async () => {
    const user = userEvent.setup();
    renderizar("/entrar");
    await screen.findByLabelText("Seu nome");
    await user.click(screen.getByRole("button", { name: "Entrar na fila" }));

    const campo = screen.getByLabelText("Seu nome");
    expect(campo).toHaveAttribute("aria-invalid", "true");
    expect(campo).toHaveAccessibleDescription(/Informe seu nome/);
    expect(campo).toHaveFocus(); // foco vai para o primeiro campo com erro
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Entrar na fila");
  });

  it("exige a escolha do tipo de atendimento", async () => {
    const user = userEvent.setup();
    renderizar("/entrar");
    await user.type(await screen.findByLabelText("Seu nome"), "Maria");
    await user.click(screen.getByRole("button", { name: "Entrar na fila" }));
    expect(screen.getByLabelText("Tipo de atendimento")).toHaveAccessibleDescription(/Escolha o tipo/);
  });

  it("preferencial só aparece em tipos que permitem (RN10)", async () => {
    const user = userEvent.setup();
    renderizar("/entrar");
    await screen.findByRole("option", { name: "Atendimento Geral" });
    const tipo = screen.getByLabelText("Tipo de atendimento");

    expect(screen.queryByLabelText("Atendimento preferencial")).not.toBeInTheDocument();
    await user.selectOptions(tipo, "Atendimento Geral");
    expect(screen.getByLabelText("Atendimento preferencial")).toBeInTheDocument();
    await user.selectOptions(tipo, "Informações");
    expect(screen.queryByLabelText("Atendimento preferencial")).not.toBeInTheDocument();
  });

  it("trocar para um tipo sem preferencial desmarca a opção", async () => {
    const user = userEvent.setup();
    renderizar("/entrar");
    await screen.findByRole("option", { name: "Atendimento Geral" });
    const tipo = screen.getByLabelText("Tipo de atendimento");
    await user.selectOptions(tipo, "Atendimento Geral");
    await user.click(screen.getByLabelText("Atendimento preferencial"));
    await user.selectOptions(tipo, "Informações");
    await user.selectOptions(tipo, "Atendimento Geral");
    expect(screen.getByLabelText("Atendimento preferencial")).not.toBeChecked();
  });

  it("entra na fila e mostra a senha, a posição e quantas pessoas estão à frente", async () => {
    const user = userEvent.setup();
    renderizar("/entrar");
    await preencherEEnviar(user, { nome: "  Maria   Souza ", tipo: "Atendimento Geral" });

    expect(await screen.findByRole("heading", { name: "Olá, Maria Souza!" })).toBeInTheDocument();
    expect(screen.getByText("A001")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Você está na posição 5. Há 4 pessoas à sua frente.");
    expect(screen.getByText("Aguardando")).toBeInTheDocument();
  });

  it("preferencial tem posição melhor e aparece identificado", async () => {
    const user = userEvent.setup();
    renderizar("/entrar");
    await preencherEEnviar(user, { nome: "Ana", tipo: "Atendimento Geral", preferencial: true });

    await screen.findByRole("heading", { name: "Olá, Ana!" });
    expect(screen.getByRole("status")).toHaveTextContent("Há 1 pessoa à sua frente.");
    expect(screen.getByText(/Preferencial/)).toBeInTheDocument();
  });

  it("a numeração da senha continua em sequência dentro do tipo", async () => {
    const user = userEvent.setup();
    const primeira = renderizar("/entrar");
    await preencherEEnviar(user, { nome: "João", tipo: "Retirada de Documentos" });
    expect(await screen.findByText("R001")).toBeInTheDocument();
    primeira.unmount();

    renderizar("/entrar");
    await preencherEEnviar(user, { nome: "Carlos", tipo: "Retirada de Documentos" });
    expect(await screen.findByText("R002")).toBeInTheDocument();
  });

  it("sair da fila pede confirmação e depois cancela", async () => {
    const user = userEvent.setup();
    renderizar("/entrar");
    await preencherEEnviar(user, { nome: "Maria", tipo: "Informações" });
    await screen.findByRole("heading", { name: "Olá, Maria!" });

    await user.click(screen.getByRole("button", { name: "Sair da fila" }));
    const confirmacao = screen.getByRole("group", { name: "Confirmar saída da fila" });
    await user.click(within(confirmacao).getByRole("button", { name: "Sim, sair da fila" }));

    expect(await screen.findByText("Você saiu da fila.")).toBeInTheDocument();
    expect(screen.getByText("Cancelado")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sair da fila" })).not.toBeInTheDocument();
  });

  it("senha inexistente mostra mensagem clara", async () => {
    renderizar("/senha/codigo-que-nao-existe");
    expect(await screen.findByRole("heading", { name: "Senha não encontrada" })).toBeInTheDocument();
  });

  it("a página inicial oferece voltar à senha em andamento", async () => {
    const user = userEvent.setup();
    const tela = renderizar("/entrar");
    await preencherEEnviar(user, { nome: "Maria", tipo: "Informações" });
    await screen.findByRole("heading", { name: "Olá, Maria!" });
    tela.unmount();

    renderizar("/");
    expect(screen.getByRole("link", { name: "Voltar para minha senha" })).toBeInTheDocument();
  });
});

describe("Área do funcionário e rotas protegidas", () => {
  it("visitante é levado ao login ao tentar abrir o painel do atendente", () => {
    renderizar("/atendente");
    expect(screen.getByRole("heading", { name: "Área do funcionário" })).toBeInTheDocument();
  });

  it("login com senha errada mostra erro acessível", async () => {
    const user = userEvent.setup();
    renderizar("/login");
    await logar(user, "admin@fila.local", "errada");
    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha incorretos.");
  });

  it("administrador entra e vê o painel administrativo", async () => {
    const user = userEvent.setup();
    renderizar("/login");
    await logar(user, "admin@fila.local", "admin123");
    expect(await screen.findByRole("heading", { name: "Painel administrativo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sair \(Administrador\)/ })).toBeInTheDocument();
  });

  it("atendente entra no painel do atendente, mas não no administrativo", async () => {
    const user = userEvent.setup();
    renderizar("/login");
    await logar(user, "atendente@fila.local", "atendente123");
    expect(await screen.findByRole("heading", { name: "Painel do atendente" })).toBeInTheDocument();
  });

  it("atendente que digita /admin recebe 'acesso negado'", () => {
    sessionStorage.setItem(
      "fv_usuario",
      JSON.stringify({ nome: "Atendente Demo", email: "atendente@fila.local", perfil: "ATENDENTE" })
    );
    renderizar("/admin");
    expect(screen.getByRole("heading", { name: "Acesso negado" })).toBeInTheDocument();
  });

  it("sair encerra a sessão e volta a proteger as rotas", async () => {
    const user = userEvent.setup();
    renderizar("/login");
    await logar(user, "admin@fila.local", "admin123");
    await screen.findByRole("heading", { name: "Painel administrativo" });
    await user.click(screen.getByRole("button", { name: /Sair/ }));
    expect(screen.getByRole("link", { name: "Área do funcionário" })).toBeInTheDocument();
    expect(sessionStorage.getItem("fv_usuario")).toBeNull();
  });
});

describe("Acompanhamento da senha (atualização automática)", () => {
  // Cria diretamente no "banco" simulado uma senha que entrou na fila há `segundos`.
  function criarSenha({ segundos = 0, aFrente = 4 } = {}) {
    const codigo = "11111111-2222-4333-8444-555555555555";
    localStorage.setItem(
      "fv_mock_senhas",
      JSON.stringify({
        [codigo]: {
          codigo_acesso: codigo, numero: 25, codigo_senha: "A025",
          nome_cliente: "João", tipo_id: 1, tipo_nome: "Atendimento Geral",
          preferencial: false, a_frente_inicial: aFrente,
          entrada: Date.now() - segundos * 1000, cancelado: false,
        },
      })
    );
    return codigo;
  }

  it("quando chega a vez, avisa com alerta e muda o título da aba", async () => {
    const codigo = criarSenha({ segundos: 120 }); // já passou o tempo todo
    renderizar(`/senha/${codigo}`);

    const aviso = await screen.findByRole("alert");
    expect(aviso).toHaveTextContent("É sua vez! Dirija-se ao atendimento.");
    expect(aviso).toHaveAttribute("aria-live", "assertive");
    expect(screen.getByText("Chamado")).toBeInTheDocument();
    expect(document.title).toBe("É sua vez! – Fila Virtual");
    // chamado: não é mais possível sair da fila (RN07)
    expect(screen.queryByRole("button", { name: "Sair da fila" })).not.toBeInTheDocument();
  });

  it("atualiza sozinho a cada 5 s e anuncia a mudança sem recarregar a página", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const codigo = criarSenha({ segundos: 0, aFrente: 2 }); // anda 1 posição a cada 8 s
      renderizar(`/senha/${codigo}`);

      expect(
        await screen.findByText("Você está na posição 3. Há 2 pessoas à sua frente.")
      ).toBeInTheDocument();

      await vi.advanceTimersByTimeAsync(10_000); // 1 posição andou
      expect(await screen.findByText("Você está na posição 2. Há 1 pessoa à sua frente.")).toBeInTheDocument();

      await vi.advanceTimersByTimeAsync(10_000); // chegou a vez
      expect(await screen.findByRole("alert")).toHaveTextContent("É sua vez!");
    } finally {
      vi.useRealTimers();
    }
  });

  it("chamado continua sendo acompanhado, mas ao sair da fila a consulta para", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const codigo = criarSenha({ segundos: 0, aFrente: 3 });
      renderizar(`/senha/${codigo}`);
      await screen.findByText(/Você está na posição 4/);

      await user.click(screen.getByRole("button", { name: "Sair da fila" }));
      await user.click(screen.getByRole("button", { name: "Sim, sair da fila" }));
      await screen.findByText("Você saiu da fila.");

      await vi.advanceTimersByTimeAsync(6_000); // deixa passar a última consulta já agendada
      const lido = vi.spyOn(Storage.prototype, "getItem");
      await vi.advanceTimersByTimeAsync(30_000);
      expect(lido).not.toHaveBeenCalledWith("fv_mock_senhas"); // parou de consultar
    } finally {
      vi.useRealTimers();
    }
  });
});
