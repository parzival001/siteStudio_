-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: sistema_studioarte
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alunos`
--

DROP TABLE IF EXISTS `alunos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alunos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `senha` varchar(255) DEFAULT NULL,
  `dados_pessoais` text,
  `telefone` varchar(20) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `complemento` varchar(255) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `uf` varchar(2) DEFAULT NULL,
  `rg` varchar(20) DEFAULT NULL,
  `cpf` varchar(20) DEFAULT NULL,
  `contrato_pdf` varchar(255) DEFAULT NULL,
  `telegram_chat_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alunos`
--

LOCK TABLES `alunos` WRITE;
/*!40000 ALTER TABLE `alunos` DISABLE KEYS */;
INSERT INTO `alunos` VALUES (1,'Aluno 01','aluno01@gmail.com','$2b$10$.mF4O5jpQ.Vgj7YQC4tnsunSmyhel5y0cCEiRh2ZnwSuX2lSi9HiC',NULL,'6199100555','2001-05-10','quadra 13','','','brasilia-df','','25857445','07256984715','contrato-1746658913766-65181234.pdf',NULL),(3,'Aluno 03','aluno03@gmail.com','$2b$10$wAUjVYJ4NLc3i/OL5hGs/unYnt8jmOCPoJ/bCx11LzEWo3COUo/4u',NULL,'61991000000','2025-05-27',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,'Aluno 02','aluno02@gmail.com','$2b$10$lrGSf2n2reDM6xwwIdutbOZLIBLDTZ.RKLTQGwBixuXJ.iem6eB0i',NULL,'610000000','2000-06-15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `alunos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alunos_aulas`
--

DROP TABLE IF EXISTS `alunos_aulas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alunos_aulas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aluno_id` int NOT NULL,
  `aula_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `aluno_id` (`aluno_id`),
  KEY `aula_id` (`aula_id`),
  CONSTRAINT `alunos_aulas_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`),
  CONSTRAINT `alunos_aulas_ibfk_2` FOREIGN KEY (`aula_id`) REFERENCES `aulas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alunos_aulas`
--

LOCK TABLES `alunos_aulas` WRITE;
/*!40000 ALTER TABLE `alunos_aulas` DISABLE KEYS */;
/*!40000 ALTER TABLE `alunos_aulas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alunos_aulas_fixas`
--

DROP TABLE IF EXISTS `alunos_aulas_fixas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alunos_aulas_fixas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aluno_id` int NOT NULL,
  `aula_fixa_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unico_aluno_aula` (`aluno_id`,`aula_fixa_id`),
  KEY `aula_fixa_id` (`aula_fixa_id`),
  CONSTRAINT `alunos_aulas_fixas_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `alunos_aulas_fixas_ibfk_2` FOREIGN KEY (`aula_fixa_id`) REFERENCES `aulas_fixas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alunos_aulas_fixas`
--

LOCK TABLES `alunos_aulas_fixas` WRITE;
/*!40000 ALTER TABLE `alunos_aulas_fixas` DISABLE KEYS */;
INSERT INTO `alunos_aulas_fixas` VALUES (20,1,11),(21,3,11),(22,3,13);
/*!40000 ALTER TABLE `alunos_aulas_fixas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `anamneses`
--

DROP TABLE IF EXISTS `anamneses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anamneses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aluno_id` int NOT NULL,
  `peso` varchar(10) DEFAULT NULL,
  `estatura` varchar(10) DEFAULT NULL,
  `contato_emergencia_nome` varchar(100) DEFAULT NULL,
  `contato_emergencia_telefone` varchar(50) DEFAULT NULL,
  `tempo_sentado` varchar(10) DEFAULT NULL,
  `atividade_fisica` varchar(10) DEFAULT NULL,
  `fumante` varchar(10) DEFAULT NULL,
  `alcool` varchar(10) DEFAULT NULL,
  `alimentacao` varchar(10) DEFAULT NULL,
  `gestante` varchar(10) DEFAULT NULL,
  `tratamento_medico` varchar(10) DEFAULT NULL,
  `lesoes` varchar(10) DEFAULT NULL,
  `marcapasso` varchar(10) DEFAULT NULL,
  `metais` varchar(10) DEFAULT NULL,
  `problema_cervical` varchar(10) DEFAULT NULL,
  `procedimento_cirurgico` varchar(10) DEFAULT NULL,
  `alergia_medicamentosa` varchar(10) DEFAULT NULL,
  `hipertensao` varchar(10) DEFAULT NULL,
  `hipotensao` varchar(10) DEFAULT NULL,
  `diabetes` varchar(10) DEFAULT NULL,
  `epilepsia` varchar(10) DEFAULT NULL,
  `labirintite` varchar(10) DEFAULT NULL,
  `observacoes` text,
  `aceite_termo` tinyint(1) DEFAULT NULL,
  `criado_em` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `aluno_id` (`aluno_id`),
  CONSTRAINT `anamneses_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anamneses`
--

LOCK TABLES `anamneses` WRITE;
/*!40000 ALTER TABLE `anamneses` DISABLE KEYS */;
INSERT INTO `anamneses` VALUES (1,1,'98,5','1,85','teste','61910000000','Sim','Sim','Sim','Sim','Não','Sim','Sim','Sim','Sim','Sim','Sim','Sim','Sim','Sim','Sim','Sim','Sim','Sim','teste',1,'2025-05-04');
/*!40000 ALTER TABLE `anamneses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aula_alunos`
--

DROP TABLE IF EXISTS `aula_alunos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aula_alunos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aula_id` int NOT NULL,
  `aluno_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `aula_id` (`aula_id`),
  KEY `aluno_id` (`aluno_id`),
  CONSTRAINT `aula_alunos_ibfk_1` FOREIGN KEY (`aula_id`) REFERENCES `aulas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `aula_alunos_ibfk_2` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aula_alunos`
--

LOCK TABLES `aula_alunos` WRITE;
/*!40000 ALTER TABLE `aula_alunos` DISABLE KEYS */;
/*!40000 ALTER TABLE `aula_alunos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aulas`
--

DROP TABLE IF EXISTS `aulas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aulas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoria_id` int DEFAULT NULL,
  `professor_id` int DEFAULT NULL,
  `data` date DEFAULT NULL,
  `horario` time DEFAULT NULL,
  `vagas` int DEFAULT NULL,
  `aula_fixa` tinyint(1) DEFAULT '0',
  `dia_semana` enum('domingo','segunda','terça','quarta','quinta','sexta','sábado') DEFAULT NULL,
  `status` enum('pendente','concluida') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pendente',
  `tipo_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `professor_id` (`professor_id`),
  KEY `aulas_ibfk_1` (`categoria_id`),
  CONSTRAINT `aulas_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `tipos_aula` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `aulas_ibfk_2` FOREIGN KEY (`professor_id`) REFERENCES `professores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aulas`
--

LOCK TABLES `aulas` WRITE;
/*!40000 ALTER TABLE `aulas` DISABLE KEYS */;
INSERT INTO `aulas` VALUES (68,3,1,'2025-06-16','11:00:00',5,0,NULL,'pendente',NULL);
/*!40000 ALTER TABLE `aulas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aulas_alunos`
--

DROP TABLE IF EXISTS `aulas_alunos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aulas_alunos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aula_id` int DEFAULT NULL,
  `aluno_id` int DEFAULT NULL,
  `presenca` tinyint(1) DEFAULT '0',
  `pacote_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `aluno_id` (`aluno_id`),
  KEY `aulas_alunos_ibfk_1` (`aula_id`),
  CONSTRAINT `aulas_alunos_ibfk_1` FOREIGN KEY (`aula_id`) REFERENCES `aulas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `aulas_alunos_ibfk_2` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=174 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aulas_alunos`
--

LOCK TABLES `aulas_alunos` WRITE;
/*!40000 ALTER TABLE `aulas_alunos` DISABLE KEYS */;
/*!40000 ALTER TABLE `aulas_alunos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aulas_fixas`
--

DROP TABLE IF EXISTS `aulas_fixas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aulas_fixas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoria_id` int NOT NULL,
  `professor_id` int NOT NULL,
  `dia_semana` varchar(15) NOT NULL,
  `horario` time NOT NULL,
  `vagas` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tipo_id` (`categoria_id`),
  KEY `professor_id` (`professor_id`),
  CONSTRAINT `aulas_fixas_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `tipos_aula` (`id`),
  CONSTRAINT `aulas_fixas_ibfk_2` FOREIGN KEY (`professor_id`) REFERENCES `professores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aulas_fixas`
--

LOCK TABLES `aulas_fixas` WRITE;
/*!40000 ALTER TABLE `aulas_fixas` DISABLE KEYS */;
INSERT INTO `aulas_fixas` VALUES (11,3,1,'quarta','10:00:00',0),(13,3,1,'domingo','10:50:00',1);
/*!40000 ALTER TABLE `aulas_fixas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `categoria_id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`categoria_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (2,'Aula Livre'),(3,'Pole Dance'),(4,'Dança01'),(5,'Dança02'),(6,'Dança03'),(7,'Dança04'),(8,'danca05'),(9,'danca06');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `creditos`
--

DROP TABLE IF EXISTS `creditos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `creditos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aluno_id` int NOT NULL,
  `categoria_id` int NOT NULL,
  `data_credito` date NOT NULL,
  `validade` date NOT NULL,
  `usado` tinyint(1) DEFAULT '0',
  `usado_em` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `aluno_id` (`aluno_id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `creditos_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`),
  CONSTRAINT `creditos_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`categoria_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `creditos`
--

LOCK TABLES `creditos` WRITE;
/*!40000 ALTER TABLE `creditos` DISABLE KEYS */;
/*!40000 ALTER TABLE `creditos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historico_aulas`
--

DROP TABLE IF EXISTS `historico_aulas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historico_aulas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aluno_id` int NOT NULL,
  `professor_id` int NOT NULL,
  `categoria_id` int NOT NULL,
  `data` date NOT NULL,
  `horario` time NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historico_aulas`
--

LOCK TABLES `historico_aulas` WRITE;
/*!40000 ALTER TABLE `historico_aulas` DISABLE KEYS */;
/*!40000 ALTER TABLE `historico_aulas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacotes`
--

DROP TABLE IF EXISTS `pacotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pacotes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  `tipo` enum('unitario','mensal','trimestral','semestral','livre') DEFAULT NULL,
  `quantidade_aulas` int DEFAULT NULL,
  `validade_dias` int DEFAULT NULL,
  `categoria_id` int DEFAULT NULL,
  `passe_livre` tinyint(1) DEFAULT '0',
  `aluno_id` int DEFAULT NULL,
  `data_validade` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `fk_pacotes_aluno` (`aluno_id`),
  CONSTRAINT `fk_pacotes_aluno` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`),
  CONSTRAINT `pacotes_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`categoria_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacotes`
--

LOCK TABLES `pacotes` WRITE;
/*!40000 ALTER TABLE `pacotes` DISABLE KEYS */;
/*!40000 ALTER TABLE `pacotes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacotes_aluno`
--

DROP TABLE IF EXISTS `pacotes_aluno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pacotes_aluno` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aluno_id` int NOT NULL,
  `categoria_id` int DEFAULT NULL,
  `tipo` enum('mensal','trimestral','semestral','anual','avulsa') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantidade_aulas` int NOT NULL,
  `data_inicio` date NOT NULL,
  `data_validade` date DEFAULT NULL,
  `aulas_utilizadas` int DEFAULT '0',
  `passe_livre` tinyint(1) DEFAULT '0',
  `pago` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `aluno_id` (`aluno_id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `pacotes_aluno_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`),
  CONSTRAINT `pacotes_aluno_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`categoria_id`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacotes_aluno`
--

LOCK TABLES `pacotes_aluno` WRITE;
/*!40000 ALTER TABLE `pacotes_aluno` DISABLE KEYS */;
INSERT INTO `pacotes_aluno` VALUES (87,1,5,'avulsa',3,'2025-06-06',NULL,0,0,1),(103,1,3,'trimestral',55,'2025-06-03','2025-09-01',13,0,1),(104,3,3,'trimestral',10,'2025-06-15','2025-09-13',2,0,1);
/*!40000 ALTER TABLE `pacotes_aluno` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacotes_modalidades`
--

DROP TABLE IF EXISTS `pacotes_modalidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pacotes_modalidades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pacote_id` int NOT NULL,
  `categoria_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `pacotes_modalidades_ibfk_1` (`pacote_id`),
  CONSTRAINT `pacotes_modalidades_ibfk_1` FOREIGN KEY (`pacote_id`) REFERENCES `pacotes_aluno` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pacotes_modalidades_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`categoria_id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacotes_modalidades`
--

LOCK TABLES `pacotes_modalidades` WRITE;
/*!40000 ALTER TABLE `pacotes_modalidades` DISABLE KEYS */;
/*!40000 ALTER TABLE `pacotes_modalidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `professores`
--

DROP TABLE IF EXISTS `professores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `professores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `senha` varchar(255) DEFAULT NULL,
  `dados_pessoais` text,
  `telefone` varchar(20) DEFAULT NULL,
  `especialidade` varchar(100) DEFAULT NULL,
  `bio` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `professores`
--

LOCK TABLES `professores` WRITE;
/*!40000 ALTER TABLE `professores` DISABLE KEYS */;
INSERT INTO `professores` VALUES (1,'Professor 01','professor01@gmail.com','senha01',NULL,NULL,NULL,NULL),(5,'Professor02','professor02@gmail.com','$2b$10$ThDow3GCtWZcPNa3QmICJO4CFlerCRJ4CzSkTge181IuhtsrmajaC','','','','');
/*!40000 ALTER TABLE `professores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_aula`
--

DROP TABLE IF EXISTS `tipos_aula`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_aula` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `tipo_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_aula`
--

LOCK TABLES `tipos_aula` WRITE;
/*!40000 ALTER TABLE `tipos_aula` DISABLE KEYS */;
INSERT INTO `tipos_aula` VALUES (1,'Dança01',1),(2,'Dança02',1),(3,'Pilates',1),(4,'Funcional',1),(5,'Yoga',1),(6,'Dança',NULL),(7,'Pilates',NULL),(8,'Funcional',NULL);
/*!40000 ALTER TABLE `tipos_aula` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-15 19:03:58
