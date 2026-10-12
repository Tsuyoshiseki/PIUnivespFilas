import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const PAINEL = { ADMIN: "/admin", ATENDENTE: "/atendente" };

export default function Layout() {
  const { usuario, sair } = useAuth();
  const { pathname } = useLocation();
  const principal = useRef(null);
  const primeiraCarga = useRef(true);

  // Ao trocar de página, leva o foco para o conteúdo (leitores de tela e teclado).
  useEffect(() => {
    if (primeiraCarga.current) {
      primeiraCarga.current = false;
      return;
    }
    principal.current?.focus();
  }, [pathname]);

  return (
    <>
      <a className="pular-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>

      <header className="cabecalho">
        <div className="container cabecalho__interno">
          <Link to="/" className="marca">
            <span aria-hidden="true"></span> Fila Virtual
          </Link>

          <nav aria-label="Principal">
            <ul className="menu">
              <li><NavLink to="/" end>Início</NavLink></li>
              <li><NavLink to="/entrar">Entrar na fila</NavLink></li>
              {usuario ? (
                <>
                  <li><NavLink to={PAINEL[usuario.perfil]}>Meu painel</NavLink></li>
                  <li>
                    <button type="button" className="btn btn--texto" onClick={sair}>
                      Sair ({usuario.nome})
                    </button>
                  </li>
                </>
              ) : (
                <li><NavLink to="/login">Área do funcionário</NavLink></li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main id="conteudo" tabIndex={-1} ref={principal} className="container principal">
        <Outlet />
      </main>

      <footer className="rodape">
        <div className="container">
          Projeto Integrador · Fila Virtual para Atendimento
        </div>
      </footer>
    </>
  );
}
