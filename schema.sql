-- =====================================================
-- Fila Virtual para Atendimento - Esquema do banco
-- SGBD: PostgreSQL 14+
-- =====================================================

-- -----------------------------------------------------
-- USUARIO: somente funcionários (ATENDENTE e ADMIN).
-- Clientes não têm conta.
-- -----------------------------------------------------
CREATE TABLE usuario (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    senha_hash  VARCHAR(255) NOT NULL,
    perfil      VARCHAR(10)  NOT NULL,
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_usuario_perfil CHECK (perfil IN ('ATENDENTE', 'ADMIN'))
);

-- -----------------------------------------------------
-- TIPO_ATENDIMENTO: define cada fila (ex.: Atendimento Geral).
-- permite_preferencial: se TRUE, o cliente pode marcar preferencial.
-- -----------------------------------------------------
CREATE TABLE tipo_atendimento (
    id                    SERIAL PRIMARY KEY,
    nome                  VARCHAR(60)  NOT NULL UNIQUE,
    descricao             VARCHAR(255),
    prefixo_senha         CHAR(1)      NOT NULL UNIQUE,
    permite_preferencial  BOOLEAN      NOT NULL DEFAULT FALSE,
    ativo                 BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT ck_tipo_prefixo CHECK (prefixo_senha ~ '^[A-Z]$')
);

-- -----------------------------------------------------
-- ATENDIMENTO: cada entrada de um cliente na fila.
-- -----------------------------------------------------
CREATE TABLE atendimento (
    id                   SERIAL PRIMARY KEY,
    tipo_atendimento_id  INTEGER      NOT NULL REFERENCES tipo_atendimento(id),
    atendente_id         INTEGER      REFERENCES usuario(id),
    nome_cliente         VARCHAR(60)  NOT NULL,
    codigo_acesso        UUID         NOT NULL UNIQUE,
    status               VARCHAR(15)  NOT NULL DEFAULT 'AGUARDANDO',
    preferencial         BOOLEAN      NOT NULL DEFAULT FALSE,
    numero_senha         INTEGER      NOT NULL,
    codigo_senha         VARCHAR(10)  NOT NULL,
    data_senha           DATE         NOT NULL DEFAULT CURRENT_DATE,
    data_entrada         TIMESTAMP    NOT NULL DEFAULT NOW(),
    data_chamada         TIMESTAMP,
    data_inicio          TIMESTAMP,
    data_finalizacao     TIMESTAMP,

    CONSTRAINT ck_atendimento_status CHECK (
        status IN ('AGUARDANDO', 'CHAMADO', 'EM_ATENDIMENTO',
                   'FINALIZADO', 'CANCELADO')
    ),
    CONSTRAINT ck_atendimento_nome CHECK (char_length(trim(nome_cliente)) >= 2),
    -- RN06: senha única por tipo e por dia
    CONSTRAINT uq_senha_tipo_dia UNIQUE (tipo_atendimento_id, data_senha, numero_senha)
);

-- -----------------------------------------------------
-- Índices (RNF06): consultas de fila e posição
-- -----------------------------------------------------
-- Fila de espera de um tipo, ordenada por chegada
CREATE INDEX ix_atend_fila
    ON atendimento (tipo_atendimento_id, preferencial DESC, data_entrada)
    WHERE status = 'AGUARDANDO';

-- Atendimento ativo de cada atendente (RN09)
CREATE INDEX ix_atend_atendente_ativo
    ON atendimento (atendente_id)
    WHERE status IN ('CHAMADO', 'EM_ATENDIMENTO');

-- Histórico e indicadores
CREATE INDEX ix_atend_finalizacao ON atendimento (data_finalizacao);

-- -----------------------------------------------------
-- RN09: um atendente só pode ter 1 atendimento ativo.
-- Garantido também pelo banco (além do Service).
-- -----------------------------------------------------
CREATE UNIQUE INDEX uq_atendente_um_ativo
    ON atendimento (atendente_id)
    WHERE status IN ('CHAMADO', 'EM_ATENDIMENTO');

-- -----------------------------------------------------
-- Dados iniciais de exemplo (tipos de atendimento)
-- O admin inicial será criado pelo backend (senha com hash).
-- -----------------------------------------------------
INSERT INTO tipo_atendimento (nome, descricao, prefixo_senha, permite_preferencial) VALUES
    ('Atendimento Geral',      'Atendimento em geral',          'A', TRUE),
    ('Retirada de Documentos', 'Retirada de documentos prontos', 'R', FALSE),
    ('Informações',            'Dúvidas e informações',         'I', FALSE);
