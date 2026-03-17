-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: sistema_studioarte
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

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
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `senha` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dados_pessoais` text COLLATE utf8mb4_unicode_ci,
  `telefone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `endereco` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `complemento` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cep` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cidade` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uf` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rg` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cpf` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contrato_pdf` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telegram_chat_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alunos`
--

LOCK TABLES `alunos` WRITE;
/*!40000 ALTER TABLE `alunos` DISABLE KEYS */;
INSERT INTO `alunos` VALUES (1,'Experimental 01','aluno01@gmail.com','$2b$10$.mF4O5jpQ.Vgj7YQC4tnsunSmyhel5y0cCEiRh2ZnwSuX2lSi9HiC',NULL,'6199100555','2020-11-14','quadra 13','','','brasilia-df','','25857445','07256984715','contrato-1746658913766-65181234.pdf',NULL),(3,'Experimental 02','aluno03@gmail.com','$2b$10$wAUjVYJ4NLc3i/OL5hGs/unYnt8jmOCPoJ/bCx11LzEWo3COUo/4u',NULL,'61991000000','2025-05-27',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,'Experimental 03 ','aluno02@gmail.com','$2b$10$lrGSf2n2reDM6xwwIdutbOZLIBLDTZ.RKLTQGwBixuXJ.iem6eB0i',NULL,'610000000','2000-06-15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,'Ana Carolina Silva Miguel ','anacarol181207@gmail.com','$2b$10$PbxIkhdtCyNOV1w6YvFvVO2gslix3W/TC4nwueezr4gHo.Q1foHdW',NULL,'(61)996067498','2007-12-18','Quadra 03, conjunto Q, Setor Sul ','Casa 11','72410217','Gama','DF','','058.975.021-61 ',NULL,NULL),(6,'Ana Gabriela de Souza Silva','anagabrielaunb@gmail.com','$2b$10$JbTIU3Hxwp9G9i.37P0mi.OTfAeYnExNh9pjGApYiSvOmM8Y12mGW',NULL,'61985272043','1999-06-03','Apartamento','301','72878360','Valparaíso de Goiás','Go','2915174','06062371199',NULL,NULL),(8,'Ana Luiza de Sousa Azevedo ','Alusd2020@gmail.com','$2b$10$cPQ3i6RePubHiuHtDmqU1eZJpfb3QNznB8.x9FeCSzHCr4AcSwKx.',NULL,'(61)992868014','2002-11-14','Quadra 8, conj J','Casa 2','72415410','Gama','DF','3315801','053.696.661-30',NULL,NULL),(9,'Beatriz Sousa Cassimiro ','biascassimiro@gmail.com','$2b$10$D9h1g8f1EDXzstOhlNy3meoEh4kj3tG.yyijerzJU50KHNPin68kK',NULL,'(61)998791998','1998-10-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,'Caroline Barbosa ','carolbarbosa89@hotmail.com','$2b$10$YEvLG0z6cizH1gdzT/eQv.v8aJ5IDPSrclHF1ysfT3yTRRQeCf1se',NULL,'(61)983512983','1989-02-28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,'Cibelle Rodrigues ','Cibelle.rrodrigues24@gmail.com','$2b$10$f.ACUr5P/5VZLXgrTqFNKOD2p1cVrI15IVfPQ26GRgTjaXl04b.5i',NULL,'(61) 998821143','2004-06-24','QI 3 lote 40/60 edifício smart club residence ','Apartamento 904 bloco B ','72445030','Gama ','DF','3985364','03652775171',NULL,NULL),(12,'Cristiane Borges ','criselisa.borges@gmail.com','$2b$10$6PqAKsSu4wAKy.zmi9R4EuQh50b1N5/vwqBhummhjSgqnd13OT7IC',NULL,'61992590837','1990-05-08',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,'Evelin Ursula ','ursulanevelin@gmail.com','$2b$10$Uwv/FGPCF68HDHQaTUci6O873iKSMekRGsL.8ZOARHNEWW5xwpUhK',NULL,'(61)984776496','1984-04-08',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,'Flavia da Fonseca Hauck Ferreira ','fla.hauck@gmail.com','$2b$10$dDfhBEPNbWHPe.QNmVstLeenaICz3yE6EDWPYCNgNgU3hJ..fsRtq',NULL,'(61)986222910','1991-01-28','QI 31 lote 3 apt 115','Ed Plinio Cantanhede','71063902','Brasília','DF','2397957','02500948196',NULL,NULL),(15,'Gabriella Torres ','gabitorres2202@gmail.com','$2b$10$Qu0Ju.Qa/zmjgqI8RaWqjuLG8AR/3o4iaeM6yG/XLI/yLxRsw4lHu',NULL,'(61) 985983371','2003-02-22','Qd 55 1/4 área especial ','Condomínio Flex Gama','72405135','Gama','DF','','05992879188',NULL,NULL),(16,'Gleice Kelly Soares ','gleicikelly@hotmail.com','$2b$10$WWc3t898X3vO/ZumU63sk./b5qvK6e3pk9xvIR1JhFpPGMv/Be4Qy',NULL,'(61)985987622','1989-07-23',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,'Halinne Nayhanne Sousa da Silva ','halinnenayhanness@gmail.com','$2b$10$cerCNO9rm/eEorv2uV4AWe/PZpn0RxqZctMEjWFf9avbH1aUgXW/S',NULL,'(61)995052303','2000-06-05','Q 3 L 9 Jardim Marília ','','','Luziânia','GO','8088886','076.650.381-07',NULL,NULL),(18,'Heloisa Gomes ','heloisinha8@hotmail.com','$2b$10$qIQAD/ZjQZ1fBOSJyzAJDeFsKVp1kFjKWLHXRkFk7vkRhfSdtMCQG',NULL,'(61) 991066686 ','1997-12-20',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(19,'Hosania Meira Amaral de Araújo','hosaniahf@hotmail.com','$2b$10$rtX1jlG0c34t6wBwBpj.U..4.YzkKKn5I33NoSr72R/PbouHyolOm',NULL,'61996488102','1981-04-23','AE 1/4 St. Central Condomínio Flex Gama Apt. 1608A','Apartamento 1608 A','72405-135','Brasília','DF','1896254','95803149187',NULL,NULL),(20,'Isabela Braz de Lira ','isabelabrazdelira@gmail.com','$2b$10$blTWT1XabS8DdFp8/V0iOOY5tiOv4hsYtUSQ1WCRlhZ8QOWbZFW4y',NULL,'(61)993430691','2005-07-28','','','','','','','',NULL,NULL),(21,'Joana Teixeira ','joanateixeira187@gmail.com','$2b$10$TjYS7B.YeTnhlNeyCBc5weskLwrhCj7B7LlABNiusKVgDnB9PQhNC',NULL,'(61)991790515','1994-10-18',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(22,'Kamila da Silva Ramos ','Kamilaramoss@icloud.com','$2b$10$ylOFXEPivoYfz0XaABqI0uxgadCPWgE5jGxJTH7ZllInjOLUeAUd.',NULL,'(61) 996634521','1992-05-08','','','','','','','',NULL,NULL),(23,'Karina Costa','Karirres2@gmail.com','$2b$10$jMs1p3PAT6HZJetaXXNyde4hM1uJXepEv3xnSSKtsxEuymvAA8T/q',NULL,'(61)992228312','1989-02-02','Área Especial 1/4','1908 Bl A Cond Flex Gama','72405610','Brasília','DF','2671932','03036247106',NULL,NULL),(24,'Laís da Mota Casqueiro de Almeida ','lais.casq@gmail.com','$2b$10$TcS18R1hxVfQ3bx2KJ2gdOh7sExzj5Q9oly/DSv/QzvT0wXUNLR1G',NULL,'(61) 982503412','1995-08-12','Quadra 56, lote 19, bloco B, apart 607','Ed. Phenicia ','72405560','Gama - Brasília ','DF','3017825','039.524.561-36 ',NULL,NULL),(25,'Laís Santos de Oliveira ','Laisso94@gmail.com','$2b$10$4OnCg2I3ISclzxLM0CHrWu36spAOVx7kJTae9RXDoYgQIYwS1scAe',NULL,'(61)981718208','2025-11-16','Quadra 30','Casa 35','72460300','Gama','Df','2581785','055.797.901-39',NULL,NULL),(26,'Lanna Oliveira ','lanna.grisostomo@gmail.com','$2b$10$rpZ9mnVV2/WADXZhC3h2GOzTDL7HhZyDw/L8jyv9c/I.J/AovmMx.',NULL,'(61)999679797','1994-08-25',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(27,'Laura Rodrigues dos Santos ','laurarodrissss2007@gmail.com','$2b$10$m54yxYTWv1wewRgiz/J.5.yt4qiyL9N6Wi4bqVfAsQsceFQowQ7vK',NULL,'(61)999984215','2007-12-17','Q 40, Casa 86 St','','72465-400','Gama-DF','','4.189.347','052.955.041-58',NULL,NULL),(28,'Lavínia do Carmo Benedito ','Lavinianutri97@gmail.com','$2b$10$wBG0sqfpdbq0naQipHgh.eQY/.NJC02IWgzjrviwYjChJWLFPhq5y',NULL,'(61)994467236','1997-07-01','Quadra 09 Setor Oeste','Casa 47','72425090','Gama','DF','3.550.016','066.267.661-04',NULL,NULL),(29,'Leonardo Mota ','leonardocostta13@gmail.com','$2b$10$LvPRUiav6ZjH1BNI1Zx6seS8pQ9JrYWnrIdI6HqgJ/DePMIslmBdq',NULL,'(61)993955177','1998-09-13','Quadra 13 conjunto G n 13 ','Setor Sul Gama','72410707','Brasília ','DF','3412321','05858324126',NULL,NULL),(30,'Lídia Sales Oliveira ','Saleslidia582@gmail.com','$2b$10$D2YFeFBGH7GQ7hfWh9Z3rebSq1ztqKtugeXuvyU9dHlwd3p/a01Gm',NULL,'(61)995932877','2025-06-19','CL 103','Conjunto D','72503200','Brasilia ','DF','7527949','06083310156',NULL,NULL),(31,'Luiza Santos Parente ','luizasparente@gmail.com','$2b$10$xoaeijRajjchVWmNcm7lF.IQQ.pm2GMVky0nsD/T0A.lBat0hEa92',NULL,'(61)981527240','2009-02-28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(32,'Maria de Fátima Anabia Loura Pio ','fatima.alp@hotmail.com','$2b$10$0RNKhnVuLoEIOtET.JEGk.BEwyadVheieWGqf3ki8IUT5wVA6LM1y',NULL,'(61)991771879','1982-03-25','','','','','','','',NULL,NULL),(33,'Maria Olívia de Sousa Cerqueira ','oliviacerqueira@gmail.com','$2b$10$mTqvn1MqBCa/rrVsMdTfT.SH9MobVZJNM0bDlWKv0o/fTK8yZfhxa',NULL,'(61)992296584','1963-12-28','QI 01 lote 480 Ed Salvador Dali ','Bloco 3 apto 504 setor de Indústria','72445010','Gama','DF','1409064 SSP GO','29626390115',NULL,NULL),(34,'Maria Telma Meneses Bandeira Paiva ','Telma8meneses@gmail.com','$2b$10$b86yGxyAJCJKi7Nd9u0rn.Qx8h5ro0aQhzNfy/P8x.A4mdDuZ0oca',NULL,'(61)985896984','1982-03-08','Quadra 7 Casa 54 Setor Oeste Gama','','72425070','Brasília','','','',NULL,NULL),(35,'Michelle Aparecida de Souza Viana','michelleano2005@yahoo.com.br','$2b$10$oXfzoHOyOgVZJT5C/Qsp5uQfO9i6e2pSqqGO/odmbW9EEvaPFiV/q',NULL,'(61)992089251','1984-07-20','Quadra 8 casa 17','Cond flores do cerrado','72873151','Valparaíso ','Go','2267737','72816554104',NULL,NULL),(36,'Mylena Ananias de Mato ','matosmylena2@gmail.com','$2b$10$us6KSFZIKv2CliIvLGQ48ugQE2nNxpFasZbv2lXbQAFcn5.g.ZoOG',NULL,'(61)992449635','2025-06-19',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(37,'Noeli Pontes ','catrina700@gmail.com','$2b$10$zi3nHmtOxEnh2zOBZeyt5O8Cw6m5KjZtwyGeYAilKowqTJu8dY6We',NULL,'(61)984582989','1972-01-15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(38,'Keyla Silva ','mnixkey@gmail.com','$2b$10$foXjHm7Lhy/TB9ZPHY8Fo.aQ5uXxz9y6WFQkVftEKgO/Yj2.GRYqS',NULL,'(61)981195984','1986-02-09','QR 209 Conjunto H, 06','','72509408','Santa Maria','DF','23333608','01478941154',NULL,NULL),(39,'Patrícia Ketlen Costa ','patricia_ketlen_@hotmail.com','$2b$10$FXyNCL33h58P7PrvQLrJeu8r8fjyjn7jRckcf84R.Hvj3kxxve3ZW',NULL,'(61)993201295','1995-05-08','Cln 7 bloco h Lote 01/02 ap 304','Ed riacho nobre ','71805548','Brasília ','Df','3178849','046.069.131-77',NULL,NULL),(41,'Priscila Aguiar ','priscilalouza@gmail.com','$2b$10$VzohgckrUE/mVmQ/cY.y3.1HYLBTPzV8af930UmlkfV2YnTFzUiYe',NULL,'(61)985097751','2025-06-19',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(42,'Rachel Lima ','rachellima.designer@gmail.com','$2b$10$NR0/W04NN4Ad7xkBTvVA0O1dCh0H2t64n1BHwZeEcD/w3ZCZIMCAS',NULL,'(61)985548823','1986-08-26',' QI 23 lote 3 Apt 301','Ed Milão ','71060631','Guará 2','DF','2321894','01126907189',NULL,NULL),(43,'Samira Ingrid Veiga Gomes Rocha ','samiraingrid7007@gmail.com','$2b$10$LxcqkomC4r8NCyU.RywMBO7cnl1UaCUGzCUn31FjZhJipBp4Kmm7G',NULL,'(61)996741421 e ','1999-03-07','Q 37 ','Casa 35','72465370','Gama Leste','DF','3645300','048.432.421-79',NULL,NULL),(44,'Sônia Martins Gonçalves ','Soniamartinsenf@gmail.com','$2b$10$cCXS.6zWnisBjuauUbwDTuSAgiefDwfVzBG.RZeH/7XlQPO2YOFBK',NULL,'(62) 996239448','2025-12-11','QI 3 ','Apto 508 B Resid Espaço Verde','72445 030','Gama','DF','','40918408172',NULL,NULL),(45,'Telma Lima ','Telma5.3@yahoo.com','$2b$10$JqSeqx1FkOKAwcgMwjh1oeUfAfQa7ThpU3iq5EWjaMYSO0uCryAhi',NULL,'(61)999349067','2025-06-19','Quadra 07','97','72425070','Brasília','DF','1345959','57936366172',NULL,NULL),(46,'Thais Cardoso Rodrigues Morais ','thaiscrmoraes@gmail.com','$2b$10$j88BX6CelqVqADvw5.1nn.ta621K7WktatBqRCDa3z6WmSNpOwscS',NULL,'(61)983265166','1988-08-13','QR 209 CONJUNTO H CASA 07','SETOR SUL ','72509408','SANTA MARIA ','DF','2568805','03396529189',NULL,NULL),(47,'Verônica Menezes Pimentel ','veronicapbio@gmail.com','$2b$10$zCP6CLJtjCmGsAyU936FpercuxU7OJ4BdX2djR1iAb9hSWfKoOSNu',NULL,'(61)92168880','1974-09-13','Qr 214 Conjunto A','Casa 2','72544401','Brasília','DF','1550 373','57294933120',NULL,NULL),(49,'Kelle Ferreira ','kelleferreira21@gmail.com','$2b$10$xaAoz3kVdQGxZunTAOBv3eqClmxmBjnly.aLB44iRR45UIHdgj63W',NULL,'(61)999235897','2025-06-20',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(50,'Lilhian Cristine','lilhianc.fernandes@gmail.com','$2b$10$Q3utkF4qhH5y8J2V8dPE/uHU2yZaTghFRm.1mdY7YPxf9oKYq1.uK',NULL,'(61)998129188','2025-06-20',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(52,'Marianne Vasconcelos Prado ','marianneprd@gmail.com','$2b$10$WsWHcg4E0bqFtQLTXizQTOs4PM3jXHyECPtjWzb9kl5HEcCfAZfvO',NULL,'(61)982335460','2025-06-20',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(55,'Thaynara Hélyda dos Santos Dias ','thayhellyda32@gmail.com','$2b$10$spxFZc5XHkKHnk2uW9zOiu6Wm949cOGjtJmlKZsccKTxBgngrkr7.',NULL,'(61)985405561','2025-06-24','','','','','','','',NULL,NULL),(56,'Mônica Ferreira ','monicacomercial@yahoo.com.br','$2b$10$7Uhx7q2Jodu0rDufFGQZ1eaz3P//M8EU5eJa6ZGxh40tVuq3bErEe',NULL,'(61)991666765','2025-06-20',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(57,'Camila Medeiros de Souza ','medeirosdesouzacamila@gmail.com','$2b$10$Fcp4drLrj0DA4qK0.LCmSuVHqZoB1ciotOEcj9MKOjiTXU2xqoiPq',NULL,'(61)992989113','2025-06-21',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(58,'Lara Valentina Lopes Custódio','Vgglopes@yahoo.com.br','$2b$10$bFpmlVymdn5Z08QHVUrfCOmmYyzGJRz0EPmFwhJFF7CkSfuqr/Trm',NULL,'(61)9996078604','2025-06-22',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(59,'Lydia Gabriela Fooshang Bustillos','lgabriela288@gmail.com','$2b$10$azirK5NQzrFdx4qr3ALLWel9yyZlAv4iudqsmDS8zsuS9xqT81Pyi',NULL,'(99) 991702785','2001-04-20','Gama, quadra 30 casa 99','','','Brasilia','Df','V400286D','60060295376',NULL,NULL),(60,'Maria Eduarda Campos Ribeiro de Moura ','marieduardacrm@gmail.com','$2b$10$RGakTmIeOlGOiZmZJvD.ZOC6WmGkT7eFej1clDfsOnK8yKYZKRLE6',NULL,'(61)991027500','2002-03-03','Sq 16 quadra 09 casa 35','Centro ','72880-604 ','Cidade ocidental ','Go','3.975.448','083.818.391-30 ',NULL,NULL),(61,'Elizabete Messias de Carvalho','liz-elizabete@hotmail.com','$2b$10$ANkwfxA7M6hSixAvpg5vIOY26RJ/dwSuuTklOti9oafSBOLggt4JC',NULL,'(61)981633802','1989-07-24','Qs 21 CJ 01 LT 01','COND 33 BL F AP 303','71884728','RIACHO FUNDO 2','DF','','026.568.101-40 ',NULL,NULL),(62,'Sarah Ezequiel Pereira ','Sarah.ezequiel.pereira@gmail.com','$2b$10$XN2dj7Xr.WuMG8OzbDXVxuEVR/R2z3RfuC703KLMjUokIQZZX357W',NULL,'(61)984549542','2007-11-10','Quadra 13 Casa 17 Setor Oeste-Gama','.','72425130','Brasília','','','',NULL,NULL),(64,'Gabrielle Ribeiro Gomes','gabrielleribeiro2010@gmail.com','$2b$10$1Z8O8eamjl7/V5cVnAeG8ewiLt8iemMqPgLZopguB7aJHc43CNrOG',NULL,'(61)993746147','2025-07-07',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(65,'Renata Lorrany Aparecida Freitas  ','renatalafreitas@gmail.com','$2b$10$0vj37Z8glR6YtGNWsOpfgOp/Nhy0WS1uGtr86dtHe3.VuP2T4Rgo2',NULL,'(61)993806556','2000-01-31','AC 319 conjunto B Lote 5','Santa Maria Norte','72549-360','Santa Maria','DF','3.628.102','069.181.471-61',NULL,NULL),(66,'Esther Mendonça Fernandes','istherfernandes@gmail.com','$2b$10$AGkpfCUUhAI6mqSxII..weJ/pl8oNBQL3PXpqdEiSkHeSeXfaQDNW',NULL,'(84)981155236','2025-07-10',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(67,'Aluno Teste','alunoteste@gmail.com','$2b$10$dfdttRFBmiaISsMacvEjO.87/KxeH/SRRFlatgbxdNNTpkvu4qHUu',NULL,'61991387118','2025-07-16',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(68,'Brenda Medeiros ','brendlynda@gmail.com','$2b$10$Tzy/xqFvMONDMFlUa/YuEOcLbbDzXt8pZfoYHWilCX8swJWhQL3IG',NULL,'(61)991824328','1995-08-20','','','','','','','',NULL,NULL),(69,'Ana Alice Alves Martins  ','aninha.repsol24@gmail.com','$2b$10$gmd5uvrsgEZJcT.oLPUS7up315/dJj5A8cgahyThc6gqEY05YqaC.',NULL,'(61)982020422','2025-08-01','Conjunto Residencial 5 Condomínio 2 S/N, 2B-0808, Parque das Cachoeiras','parque clube 01','72872-610','Valparaíso','GO','3429733','060.670.961-45',NULL,NULL),(70,'Débora Brito ','deborabrito177@gmail.com','$2b$10$TM0263pdovUL9YseMB6sROzLP6xQW0GlqB8IzUxjGmBSrY2.3KGme',NULL,'(61)981963653','1993-11-11','Rua 44 quadra 63 lote 5 B','II Etapa','72971044','Valparaíso de Goiás','','','03780797194',NULL,NULL),(71,'Karen Luisa Sousa dos Santos','karenluisa222@gmail.com','$2b$10$Q1qbFtwJ8inubdaUWFOLNOISDCvgbDooBsMVV3e8LPcYXY7LTyL6a',NULL,'(61)984787901','2025-08-08','Quadra 56, Edifício Roma, Apartamento 302 Setor Central - Gama','','72405-560','BRASÍLIA','DF','3599055','070.025.461-71',NULL,NULL),(72,'Aline Martins de Souza Nascimento','alinemsn1@gmail.com','$2b$10$M0M2LEVmcKiZhDOoonA7CubKJbx0b7YErX4HO6MPVO4LNAn9KdOoi',NULL,'(61)998243396','1982-05-31','Rua Alamêda dos Ipês Condomínio Bougainville ','Casa 14A','72426075','Ponte Alta Norte ','DF','11756897','013.693.756-03 ',NULL,NULL),(73,'Jôrdanna Pimenta Teixeira da Silva ','jordannapimenta@gmail.com','$2b$10$Jdbh96BzfSw9ccnEdWRNiuVNJ2w17OP5vziemNdog3Qm6EahiFQiq',NULL,'(61)985930476','1996-03-19','AE 01 LD LESTE LT 24/25 Bl C APTO 1003','Edifício Orion','72405610','Gama - Setor Central','DF','','',NULL,NULL),(75,'Bruna Larissa Pires Azevedo ','brunalarissapiresazevedoo@gmail.com','$2b$10$s/FURBeW2R5FWGIBIMV/ee2AFUQLI3jNbyxMYpADJuPmWSFEUAlgW',NULL,'(61)995573691','2025-08-23',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(76,'Niceias Morais Machado  ','niceias@gmail.com','$2b$10$H3gkrfkYax7CSyfDsx5Oluw4mtT.QivP7AwrsYyVfgEnFGAamKnW.',NULL,'(61)999497030','1982-08-14','','','','','','','',NULL,NULL),(77,'Aline Louzeiro Dos Santos  ','louzeiroaline99@gmail.com','$2b$10$/6Z6FKltMk2d8CQFeks0EuOEY66893XzXtZAZSb4tGYmSzNlIj5US',NULL,'(61)995311277','1995-11-14','QR 312 Conjunto B Casa 18','Casa','72.542-502','Brasília','','','056.326.671-62',NULL,NULL),(78,'Camila da Paz Reis ','comislaa@gmail.com','$2b$10$8k10BR4iHIIVAkkMeXia4e9lMI5byY9FhQ/l9T0jXLj.X.QyGoklK',NULL,'(61)996757573','1997-12-12','Quadra 40 lote 103 Setor Leste','fundos ','72465400','Gama','DF','3389503','05830479125',NULL,NULL),(87,'Lidiane Silva de Paula ','lidianesilvadepaula@gmail.com','$2b$10$CPE571yJfr2z5g3uhKPnn.wfSy26NB2tGzdz6MdbwTyx13lB2UZsy',NULL,'(61)993707629','1995-09-17','Quadra 601 conjunto 08 casa 16A','Recanto','72640-108','Recanto das emas','DF','3182981','05149120146',NULL,NULL),(89,'Cintia Cristina de Queiroz','cintiacristina.q@gmail.com','$2b$10$yl9EkBRl11STEbEq5xEBMuV1eNyY1OuTtna8atNhUNHKJc0LDmiTe',NULL,'(61)983169624','1980-05-16','','','','','','','',NULL,NULL),(90,'Arielly Fernandes Silva','arielly.fernandes22@gmail.com','$2b$10$XY4TSZUOAv6sk6pCv9Uy8OeOzkbzqK3U16hUgJ5qPsKFx3I202rbO',NULL,'(62)982144040','1999-01-15','Parque Clube 1, CR-05, Bloco 1C, Apto 001, Parque das Cachoeiras ','','72872-600','Valparaíso de Goiás','GO','5182452','064.253.931-65',NULL,NULL),(91,'Mary Victorya de Souza Oliveira','Victorya.mary@icloud.com','$2b$10$wbymjStUZ1o3ZFxBXyFl3uunXx4vJP.w5hRvqVIOKx6Y9LlVmV/K6',NULL,'(61)992234242','2025-10-02','','','','','','','',NULL,NULL),(92,'Maria Luiza Martins da Silva','mmariahluiza16@gmail.com','$2b$10$IaqycjSY1/zJ36cXvfxqlOnfO4zQvtOUNQ6mok8X8Ks6redkLVpqG',NULL,'(61)998438395','2025-10-02',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(93,'Dyovana Gabriely Pacheco Brito ','dyogabriely@gmail.com','$2b$10$t.dnBNsaB/jBPVmhkiwZkOU5NrDSBcArMoFzhmX6CXM0vXVIHtNha',NULL,'(61)991761687','2007-05-11','quadra 4 lote A20 casa 2','mingone ll','72854712','luziania ','GO','4318229','71667901133',NULL,NULL),(94,'Ana Caroline Alves da Cunha ','prof.acarolineac@gmail.com','$2b$10$Q4qcTXuu8B.Z1IadJwPtUuraYCAMSFDBeD4OPs09Xqli8ZnRe6AHO',NULL,'(61)983002455','2025-10-13',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(95,'Sabrina Almeida Porto','Sabrinaporto1502@gmail.com','$2b$10$RU1c7oMZY0nfs7T4sZOEJ.0mk.w8bTiMOl0OMr0it1iYvdLkczPty',NULL,'61985409072','2025-11-03',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(96,'Raquel Soraia Veras Botelho da Costa','rsoraia.costa@gmail.com','$2b$10$NnA0afarCGEDfxrsFy72m.Xb6zjdtlbGd5FDIzH9t793rEZUFTl1S',NULL,'(61)93618-0165','1993-11-15','QD 16 CASA 29 SETOR OESTE','','72420160','GAMA','DF','2916668','038.834.991-37',NULL,NULL),(97,'Rhaynara Morais de Almeida Santos','moraisrhaynara@gmail.com','$2b$10$13wEl0Vsd6DoXG9SWIEF0Oe2llFjF0ramGLn2MBMK2fy2NVRUz2o6',NULL,'(61)983490700','2025-03-31','Quadra 55, Ed. Omega','306','72405550','Gama','DF','3326226','05668078159',NULL,NULL),(98,'Suiane Letícia Araújo da Silva','suianearaujosilva@gmail.com','$2b$10$G1wO4PWJlGh3OhkuPfE.AOE.h3.WX49VPJGOGlY2Fgus/yIWXIgKu',NULL,'(61)992157650','1997-07-05','','','','','DF','3508303','037.851.151-30',NULL,NULL),(99,'Nauane Oliveira Ferreira  ','nauaneo438@gmail.com','$2b$10$WK6KLJ1.z1VuchwrPiOn7O6Dgyah86kJVJ5XmJ47oHK8lFUAuZW.2',NULL,'(61)998639991','2026-01-05',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(100,'Ingrid Franceli Filgueiras   ','Ingrid_francelli@hotmail.com','$2b$10$O.AeARzwik6awBu/gmChjOiOCSXE0D2WNRg5C2fuzsFKZ8RusqMtK',NULL,'(61)991664642','2026-01-06',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(101,'Karine de Lima Gonçalves  ','karine.cellbita@gmail.com','$2b$10$O2G40cfhRnCqlUZ8kWw5h.VkK1VJnbzkziB33dPNiFRuKH.u9MN8a',NULL,'(61) 995449683','2006-02-22','Quadra 208 conjunto H casa 25','','72508408','Santa Maria','DF','','03505109118',NULL,NULL),(102,'Lilian Oliveira Soares','lilianoliver81@gmail.com','$2b$10$sk8/r.bz65ntooxi0Ic3dOiYa/XZwEVfZY7xVF.uqCU0BZl/Vv4MG',NULL,'(61)998497923','2026-01-08',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(103,'Maria José Alexandre Da Rocha  ','maria55jose@hotmail.com','$2b$10$5aobAFQUVt5h4UZ1L5uWMedHus9OrcgdEBK9hl2AMyMSDvxLy/SBS',NULL,'(61)991031212','2026-01-16',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(104,'Dyovanna Aparecida Gomes Barreiros   ','Aparecidadyovanna@gmail.com','$2b$10$hSDELIwT6Lue461xbKf7IOALarPDF.rgXP/FovzAmNFC3PVwh/ic.',NULL,'(61)996466919','2026-01-19',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(105,'Andressa Thaís Fonseca da Costa','Andressa_tfc@hotmail.com','$2b$10$lhu31AUps53mbKISjLIHyuogCw6sWn0h7MW4.zQFYh5hf2IdLJUz6',NULL,'(61)982666368','2026-01-19',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(106,'Cristiane Pereira Chaves data de nascimento ','Cristianechaves7002@hotmail.com','$2b$10$y1vXRqllzlXrNehS1iTLX.kw/5EBzIt.35fAw89DUtdUmrxKaA.hm',NULL,'(61)986014518','1985-11-05',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(107,'Hevelyn Cabral Lacerda ','hevelacerda1702@gmail.com','$2b$10$c6PjoKD1OZJms76zoWR95.IEZXVJkFieCIl2Wv2TNuK4ibQ6k4.K.',NULL,'(61)993706717','1998-12-08','Q55 LT 3/6 BL 08  ap 309  edifício Nova York ','309','72405550','Gama ','Df','3690486','06870025169 ',NULL,NULL),(108,'Jennifer Oliveira dos Santos   ','Jennifer.beijaflor@gmail.com','$2b$10$JPZQdTB473t0MbhDWroZc.So9wl/jx6YH2r6JTOOIgrzkqEs3BLUy',NULL,'(61)982840216','1998-10-25',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(109,'Silviane Vaz Pinto dos Santos   ','svps10@gmail.com','$2b$10$YlGOohcve46.i3UxAiy2Au7u9XWRNOg63zh3Zn1Zrzh.1xif7NEba',NULL,'(61)993081367','1994-12-26',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(110,' Laura Vitória Oliveira de Sousa  ','laura.totoia1@gmail.com','$2b$10$ISYqUHMGPEhpxc.2FyB9Hu2IC3udXDRiJEwzllorTACpVzlL6spSW',NULL,'(61)994306886','2010-08-11',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(111,'Leticia Rocha da Silva','leticiasilva0584@gmail.com','$2b$10$9xTk3gwUBi0S0acpMWU6TOE.DFmlfdu0SuKzmxMEOwt20TJCuexx2',NULL,'(61) 986531577','2000-10-05','rua 20 q 18 l 9','lote 9','72870-265','valparaiso ','go','3132040','04902968150',NULL,NULL),(112,'Sabrina Araújo Reis ','Reisaraujosabrina@gmail.com','$2b$10$OvSKMMvHTq2U1AEfg/s4tOQes7dXS0Gbz.2HD9p/JgNG37wV8x432',NULL,'(61)994230699','2022-10-22',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(113,'Eduarda Monteiro Escorcio e Silva    ','eduarda.escorcio@outlook.com','$2b$10$2WkgnaRmGKpZu.NWzsini.dYArC9liD7S9CBtzsyuP2xPMydtahkq',NULL,'(61)996859732','2003-05-16',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(114,'Luísa Medeiros Santos  ','luisa.m.santos910@gmail.com','$2b$10$wRKeUj0FamszBqEn.DvqAOWH.D97DXn489I1Psr6vS9J2jqFlFj/C',NULL,'61993980972','2009-11-09',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(115,'Júlia Salles Menezes    ','Salles.mjulia@gmail.com','$2b$10$okK0cksIMvx7EfkCazZHQOF7sE5OSXQ77dbt5FGTwKKgQmnn.Lo4G',NULL,'(61)99286757','1996-12-27',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(116,'Priscila Helena de Oliveira  ','pry_helena@hotmail.com','$2b$10$p/.YjzbUepIl1lNMVFic8.fI6B9OgibKVp5cHU1dowbxuVFphv2P2',NULL,'(61)981985963','1990-11-24',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
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
  `eh_fixo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unico_aluno_aula` (`aluno_id`,`aula_fixa_id`),
  KEY `aula_fixa_id` (`aula_fixa_id`),
  CONSTRAINT `alunos_aulas_fixas_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `alunos_aulas_fixas_ibfk_2` FOREIGN KEY (`aula_fixa_id`) REFERENCES `aulas_fixas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2491 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alunos_aulas_fixas`
--

LOCK TABLES `alunos_aulas_fixas` WRITE;
/*!40000 ALTER TABLE `alunos_aulas_fixas` DISABLE KEYS */;
INSERT INTO `alunos_aulas_fixas` VALUES (1978,12,216,1),(2046,38,216,1),(2105,103,241,1),(2106,27,241,1),(2182,37,217,1),(2183,103,217,1),(2269,47,245,1),(2270,33,245,1),(2277,55,207,1),(2286,37,241,1),(2287,47,213,1),(2291,46,216,1),(2346,15,216,1),(2376,107,247,1),(2383,44,245,1),(2384,5,206,1),(2387,38,263,1),(2388,46,263,1),(2392,10,241,1),(2394,110,207,1),(2402,50,264,1),(2403,110,264,1),(2405,111,247,1),(2427,89,262,1),(2430,113,213,1),(2441,72,245,1),(2443,12,263,1),(2444,72,213,1),(2445,114,258,1),(2447,14,245,0),(2456,114,268,1),(2458,50,207,1),(2459,57,225,1),(2460,14,213,1),(2461,115,213,1),(2462,32,216,1),(2464,28,247,1),(2465,20,217,0),(2466,42,258,0),(2467,72,269,0),(2469,44,217,0),(2470,44,218,0),(2471,44,254,0),(2474,8,217,0),(2475,45,216,0),(2477,112,265,0),(2479,34,263,0),(2480,49,254,0),(2481,1,207,1),(2482,108,270,1),(2483,69,270,1),(2484,15,270,1),(2485,28,241,0),(2486,56,270,1),(2487,70,270,0),(2488,30,268,0),(2489,62,251,0),(2490,116,263,1);
/*!40000 ALTER TABLE `alunos_aulas_fixas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alunos_fixos_aulas_fixas`
--

DROP TABLE IF EXISTS `alunos_fixos_aulas_fixas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alunos_fixos_aulas_fixas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aluno_id` int NOT NULL,
  `aula_fixa_id` int NOT NULL,
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `aluno_id` (`aluno_id`,`aula_fixa_id`),
  KEY `aula_fixa_id` (`aula_fixa_id`),
  CONSTRAINT `alunos_fixos_aulas_fixas_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`),
  CONSTRAINT `alunos_fixos_aulas_fixas_ibfk_2` FOREIGN KEY (`aula_fixa_id`) REFERENCES `aulas_fixas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alunos_fixos_aulas_fixas`
--

LOCK TABLES `alunos_fixos_aulas_fixas` WRITE;
/*!40000 ALTER TABLE `alunos_fixos_aulas_fixas` DISABLE KEYS */;
/*!40000 ALTER TABLE `alunos_fixos_aulas_fixas` ENABLE KEYS */;
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
  `peso` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estatura` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contato_emergencia_nome` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contato_emergencia_telefone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tempo_sentado` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `atividade_fisica` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fumante` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alcool` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alimentacao` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gestante` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tratamento_medico` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lesoes` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `marcapasso` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metais` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `problema_cervical` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `procedimento_cirurgico` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alergia_medicamentosa` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hipertensao` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hipotensao` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diabetes` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `epilepsia` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `labirintite` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observacoes` text COLLATE utf8mb4_unicode_ci,
  `aceite_termo` tinyint(1) DEFAULT NULL,
  `criado_em` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `aluno_id` (`aluno_id`),
  CONSTRAINT `anamneses_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anamneses`
--

LOCK TABLES `anamneses` WRITE;
/*!40000 ALTER TABLE `anamneses` DISABLE KEYS */;
INSERT INTO `anamneses` VALUES (1,1,'98,5','1,85','teste','61910000000','Sim','Sim','Sim','Sim','Não','Sim','Sim','Sim','Sim','Sim','Sim','Sim','Sim','Sim','Sim','Sim','Sim','Sim','teste',1,'2025-05-04'),(3,42,'58kg','1,64','Rafael (esposo) ','61996758880','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','Alérgica a composição da medicação sulfa ',1,NULL),(4,39,'62','1.49','Reginaldo ','6185819012','Sim','Sim','Não','Sim','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(5,28,'58','1.55','Edna (mãe)','35418226','Sim','Não','Não','Sim','Sim','Não','Não','Sim','Não','Sim','Não','Sim','Sim','Não','Não','Não','Não','Não','Cirurgia no joelho 2014 e Lesão ligamentar na mão esquerda no quinto dedo 2023.\r\n\r\n\r\nNão faço outra atividade física\r\n\r\n\r\n\r\nAlergia: antibiótico \r\n\r\nMetais: pino no joelho esquerdo\r\n\r\n',1,NULL),(6,35,'80','1,70','Yasmim','61 98296-0170','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','Não','',1,NULL),(7,19,'76kg','161','Fábio ','61 99999-5946 ','Sim','Sim','Não','Sim','Sim','Não','Sim','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','Não','',1,NULL),(8,27,'48kg','1,60','Katlen Andrade Eutaquio ','61 999984215','Sim','Sim','Sim','Sim','Sim','Não','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(9,47,'70','1.74','Evillyn ','99398 8688','Sim','Sim','Não','Sim','Sim','Não','Não','Sim','Não','Não','Sim','Sim','Não','Sim','Não','Não','Não','Não','',1,NULL),(10,15,' 62','1,55','Edna','61984918025','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(11,59,'70','157cm','Gabriel Lima','+55 61 98435-9509','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','',1,NULL),(12,60,'65kg','1,65cm','Matheus ','62 998714169','Sim','Sim','Sim','Sim','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(13,24,'70kg','1,74','Henrique (esposo)','61981445814','Sim','Sim','Não','Sim','Sim','Não','Não','Não','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','',1,NULL),(14,8,'54','1.59','Linara/ Iohanan','(61)9269-0721/ (61)8233-0185','Sim','Sim','Não','Sim','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',0,NULL),(15,9,'46','157','','','Sim','Sim','Sim','Sim','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(16,33,'63 kg','1.55','','','Sim','Sim','Não','Sim','Sim','Não','Não','Não','Não','Não','Sim','Sim','Não','Sim','Não','Sim','Não','Não','',1,NULL),(17,61,'64','1,61','Thiago ','+5561981491901','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','Não','',1,NULL),(18,11,'57','1,63','Cleonice ','61982362200','Sim','Sim','Não','Sim','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(19,5,'63','1.65','Rosângela Soares Miguel','61 86167687','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','',1,NULL),(20,44,'59','1,54','','','Sim','Sim','Não','Sim','Sim','Não','Sim','Sim','Não','Sim','Não','Sim','Não','Não','Não','Não','Não','Não','',0,NULL),(21,6,'57','1,67','Beatriz','61985285888','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(22,43,'70','170','Matheus ','61982260307','Sim','Sim','Não','Não','Sim','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(23,65,'53','1,54','Maria José','(61)993720844','Sim','Sim','Não','Sim','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(24,64,'48kg','1m48','Rafael','61 982299788','Sim','Sim','Sim','Sim','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Sim','Não','',1,NULL),(25,72,'63kg','1,60','Leandro (marido)','(61)981379878','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Sim','Sim','Não','Sim','Não','Não','Não','TENHO ALERGIA A TRAMAL E BUSCOPAM',1,NULL),(26,46,'77','161','Luciana ','61993565279','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(27,38,'85','1,64','Jéssica','61 99607-9623','Sim','Sim','Não','Não','Sim','Não','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(28,62,'48kg','1,50','+55 61 98577-6176 (Cléa/mãe)','+55 61 98454-9542','Sim','Sim','Não','Não','Sim','Não','Sim','Sim','Não','Não','Não','Não','Não','Não','Sim','Não','Não','Não','',1,NULL),(29,20,'56','1,54','61984273340 (irlandia ','61993430691','Sim','Sim','Não','Não','Sim','Não','Não','Sim','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(30,73,'57','1,57','Marcus (esposo)','(61) 99353-2082','Sim','Sim','Não','Sim','Sim','Não','Não','Não','Não','Não','Não','Não','Sim','Não','Sim','Não','Não','Não','Alergia a dipirona ',1,NULL),(31,23,'53','165','Luciana ','61 99282-5313','Sim','Sim','Não','Sim','Sim','Não','Não','Não','Não','Sim','Não','Sim','Não','Não','Não','Não','Não','Não','',1,NULL),(32,77,'70','1,60','61993276916','61995311277','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(33,87,'65','1,60','Ikaro ','61982494943','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(34,93,'80','1,70','Laiz (mãe)','61 993159963','Sim','Não','Não','Sim','Sim','Não','Sim','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(35,92,'80','1,51','6199837331 Daniele','61998438395','Sim','Sim','Não','Sim','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(36,91,'80','1.65','Herica (mãe)','+55 61 99653-5247','Sim','Sim','Não','Sim','Sim','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Sim','',1,NULL),(37,71,'70','1,55','Lucia','61985794224','Sim','Sim','Não','Não','Sim','Não','Sim','Não','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','',1,NULL),(38,17,'56','1,71 ','','61995052303','Não','Sim','Sim','Sim','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(39,70,'69','158','Allan Soares','61992730668','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(40,45,'45','1.50','Nayara','61 98679-4893','Sim','Sim','Não','Sim','Sim','Não','Não','Sim','Não','Não','Não','Sim','Não','Não','Não','Não','Não','Não','',1,NULL),(41,69,'59','1,65','61982081640','61982020422','Não','Sim','Não','Sim','Sim','Não','Não','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','Não','',1,NULL),(42,96,'57','1,59','Pedro Artur','6198189-7077','Sim','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(43,55,'57','1.60','Igor','61998485832','Sim','Sim','Não','Sim','Sim','Não','Não','Não','Não','Não','Não','Não','Sim','Não','Sim','Não','Não','Não','',1,NULL),(44,34,'58','1.55','Hermano Francisco','61985896984','Não','Sim','Não','Sim','Sim','Não','Não','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','Não','',1,NULL),(45,14,'55','163','Diego','993845885','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(46,90,'57,00','1,68','Lilian Fernandes da Cunha Silva','(62) 99611-637','Sim','Sim','Não','Sim','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(47,25,'70','1,59','Elisângela ','61993565715','Não','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Sim','Não','Sim','Não','',1,NULL),(48,32,'62','1,55','','','Não','Sim','Não','Sim','Sim','Não','Não','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','Não','',1,NULL),(49,10,'56','1,65','Heleno ','993122239','Sim','Sim','Não','Não','Sim','Não','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Cisto no punho esquerdo. ',1,NULL),(50,49,'78','161','Andrey','+55 61 9285-8023','Sim','Sim','Não','Não','Sim','Sim','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Sim','Não','Não','',1,NULL),(51,78,'80','1,80','Claudia (mãe)','61986167489','Sim','Não','Sim','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','',0,NULL),(52,97,'58','1,59','Ilnar ','61 981122691','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','Alergia dipirona, ibuprofeno ',1,NULL),(53,37,'77','1,60','Werlen','61984946005','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não sei se tenho alergia a algum remédio pq nunca fiz uso',1,NULL),(54,94,'73kg','1,64','Victor Alexsander','6199714198','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','Não','',1,NULL),(55,101,'90','','Rosália ','61992197384','Sim','Sim','Sim','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(56,107,'55','1.56','','','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Sim','Não','Não','Não','Não','Não','Não','',1,NULL),(57,111,'67','1,54','mae','61984843616','Sim','Sim','Não','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(58,110,'78,5','1,70','Layane Pires Olivera ','55 61 992821489','Sim','Não','Não','Não','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(59,112,'50','1,52','Maria de Fátima ','61991761890','Sim','Sim','Não','Não','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL),(60,113,'53kg','1.59m','Julia','61 984294294','Sim','Sim','Não','Sim','Sim','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','Não','',1,NULL);
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
  `dia_semana` enum('domingo','segunda','terça','quarta','quinta','sexta','sábado') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pendente','concluida') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pendente',
  `tipo_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `professor_id` (`professor_id`),
  KEY `aulas_ibfk_1` (`categoria_id`),
  CONSTRAINT `aulas_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `tipos_aula` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `aulas_ibfk_2` FOREIGN KEY (`professor_id`) REFERENCES `professores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aulas`
--

LOCK TABLES `aulas` WRITE;
/*!40000 ALTER TABLE `aulas` DISABLE KEYS */;
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
  `dia_semana` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `horario` time NOT NULL,
  `vagas` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tipo_id` (`categoria_id`),
  KEY `professor_id` (`professor_id`),
  CONSTRAINT `aulas_fixas_ibfk_2` FOREIGN KEY (`professor_id`) REFERENCES `professores` (`id`),
  CONSTRAINT `fk_aulas_fixas_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`categoria_id`)
) ENGINE=InnoDB AUTO_INCREMENT=271 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aulas_fixas`
--

LOCK TABLES `aulas_fixas` WRITE;
/*!40000 ALTER TABLE `aulas_fixas` DISABLE KEYS */;
INSERT INTO `aulas_fixas` VALUES (206,11,6,'terça','18:00:00',2),(207,3,6,'terça','19:00:00',2),(213,3,6,'quinta','17:00:00',0),(216,3,6,'quinta','20:00:00',0),(217,3,6,'sexta','09:00:00',0),(218,11,6,'sexta','10:00:00',4),(225,14,7,'quarta','20:00:00',3),(228,16,10,'quinta','18:00:00',6),(231,3,6,'segunda','20:00:00',6),(241,3,6,'quarta','09:00:00',0),(242,11,6,'quarta','09:00:00',1),(245,3,6,'terça','17:00:00',0),(247,3,6,'sexta','20:00:00',2),(248,16,10,'segunda','20:00:00',5),(251,16,10,'terça','17:00:00',5),(252,16,10,'quarta','09:00:00',6),(254,14,7,'sábado','10:00:00',2),(258,3,6,'quinta','18:00:00',3),(262,3,6,'terça','18:00:00',2),(263,3,6,'terça','20:00:00',1),(264,3,6,'quinta','19:00:00',4),(265,3,6,'sexta','20:00:00',0),(267,3,6,'segunda','21:00:00',6),(268,3,6,'terça','16:00:00',4),(269,18,11,'sábado','11:00:00',4),(270,3,6,'terça','21:00:00',1);
/*!40000 ALTER TABLE `aulas_fixas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aulas_fixas_desistencias`
--

DROP TABLE IF EXISTS `aulas_fixas_desistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aulas_fixas_desistencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aluno_id` int DEFAULT NULL,
  `aula_fixa_id` int DEFAULT NULL,
  `data` date DEFAULT NULL,
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `aluno_id` (`aluno_id`),
  KEY `aula_fixa_id` (`aula_fixa_id`),
  CONSTRAINT `aulas_fixas_desistencias_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aulas_fixas_desistencias`
--

LOCK TABLES `aulas_fixas_desistencias` WRITE;
/*!40000 ALTER TABLE `aulas_fixas_desistencias` DISABLE KEYS */;
INSERT INTO `aulas_fixas_desistencias` VALUES (1,28,267,'2026-03-16','2026-03-16 18:12:34'),(2,34,231,'2026-03-16','2026-03-16 19:42:52'),(3,34,247,'2026-03-20','2026-03-16 19:44:09'),(4,70,231,'2026-03-23','2026-03-16 20:58:06'),(5,39,263,'2026-03-17','2026-03-17 03:05:20'),(6,30,268,'2026-03-17','2026-03-17 04:25:40'),(7,62,268,'2026-03-17','2026-03-17 06:21:15');
/*!40000 ALTER TABLE `aulas_fixas_desistencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `categoria_id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`categoria_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (2,'Aula Livre'),(3,'Pole Dance'),(5,'Dança02'),(10,'Passe Livre '),(11,'Pole Flow '),(12,'Pole Sensual '),(13,'Pole Flex '),(14,'Lira'),(15,'Tecido '),(16,'Treino Livre '),(18,'Chair Dance '),(19,'Pole Strap');
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
-- Table structure for table `desistencias_aula_fixa`
--

DROP TABLE IF EXISTS `desistencias_aula_fixa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `desistencias_aula_fixa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aluno_id` int NOT NULL,
  `aula_fixa_id` int NOT NULL,
  `data` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `aluno_id` (`aluno_id`,`aula_fixa_id`,`data`),
  KEY `aula_fixa_id` (`aula_fixa_id`),
  CONSTRAINT `desistencias_aula_fixa_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`),
  CONSTRAINT `desistencias_aula_fixa_ibfk_2` FOREIGN KEY (`aula_fixa_id`) REFERENCES `aulas_fixas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `desistencias_aula_fixa`
--

LOCK TABLES `desistencias_aula_fixa` WRITE;
/*!40000 ALTER TABLE `desistencias_aula_fixa` DISABLE KEYS */;
/*!40000 ALTER TABLE `desistencias_aula_fixa` ENABLE KEYS */;
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
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` enum('unitario','mensal','trimestral','semestral','livre') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=702 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacotes_aluno`
--

LOCK TABLES `pacotes_aluno` WRITE;
/*!40000 ALTER TABLE `pacotes_aluno` DISABLE KEYS */;
INSERT INTO `pacotes_aluno` VALUES (121,19,14,'avulsa',3,'2025-07-31',NULL,0,0,1),(123,22,3,'mensal',3,'2025-06-03','2025-07-03',3,0,1),(130,6,NULL,'semestral',38,'2025-06-23','2025-12-20',34,1,1),(131,28,3,'avulsa',1,'2025-06-03',NULL,1,0,1),(133,30,3,'mensal',2,'2025-06-10','2025-07-10',2,0,1),(137,35,3,'mensal',8,'2025-07-10','2025-08-09',6,0,1),(140,36,3,'mensal',2,'2025-06-09','2025-07-09',1,0,1),(145,41,11,'mensal',1,'2025-06-13','2025-07-13',1,0,1),(151,47,13,'avulsa',2,'2025-06-19',NULL,0,0,1),(155,5,3,'mensal',0,'2025-06-05','2025-07-05',1,0,1),(157,9,3,'mensal',2,'2025-06-03','2025-07-03',2,0,1),(158,10,3,'mensal',1,'2025-06-14','2025-07-14',1,0,1),(159,11,3,'mensal',3,'2025-06-10','2025-07-10',3,0,1),(160,12,3,'mensal',1,'2025-06-03','2025-07-03',1,0,1),(161,13,3,'mensal',8,'2025-06-23','2025-07-23',8,0,1),(163,14,NULL,'semestral',19,'2025-04-11','2025-10-08',19,1,1),(164,15,3,'mensal',1,'2025-05-29','2025-06-28',2,0,1),(165,16,NULL,'anual',20,'2024-11-21','2025-11-21',16,1,1),(166,17,12,'mensal',1,'2025-06-16','2025-07-16',1,0,1),(167,21,3,'mensal',4,'2025-06-23','2025-07-23',4,0,1),(168,23,NULL,'anual',32,'2025-03-08','2026-03-08',12,1,1),(169,49,3,'mensal',0,'2025-06-07','2025-07-07',1,0,1),(171,49,3,'mensal',4,'2025-07-21','2025-08-20',4,0,1),(172,24,3,'mensal',3,'2025-06-14','2025-07-14',3,0,1),(173,25,3,'mensal',2,'2025-06-17','2025-07-17',2,0,1),(174,26,NULL,'trimestral',8,'2025-06-07','2025-09-05',8,1,1),(176,27,3,'mensal',3,'2025-06-26','2025-07-26',3,0,0),(178,31,3,'mensal',1,'2025-06-16','2025-07-16',1,0,1),(179,31,3,'mensal',4,'2025-07-01','2025-07-31',1,0,1),(180,50,3,'mensal',1,'2025-06-07','2025-07-07',1,0,1),(182,33,3,'mensal',2,'2025-06-17','2025-07-17',2,0,1),(183,35,3,'mensal',1,'2025-06-05','2025-07-05',1,0,1),(184,37,3,'mensal',6,'2025-06-25','2025-07-25',6,0,1),(185,38,3,'mensal',1,'2025-06-03','2025-07-03',1,0,1),(186,39,3,'mensal',0,'2025-06-09','2025-07-09',1,0,1),(188,42,3,'mensal',1,'2025-06-14','2025-07-14',1,0,1),(189,44,3,'mensal',2,'2025-06-20','2025-07-20',2,0,1),(190,45,3,'mensal',2,'2025-06-01','2025-07-01',1,0,1),(191,46,3,'mensal',4,'2025-06-12','2025-07-12',4,0,1),(192,46,3,'mensal',8,'2025-07-15','2025-08-14',7,0,1),(193,47,3,'mensal',3,'2025-06-09','2025-07-09',3,0,1),(194,52,3,'mensal',2,'2025-06-09','2025-07-09',2,0,1),(195,52,11,'mensal',2,'2025-06-09','2025-07-09',0,0,1),(199,56,3,'mensal',2,'2025-06-10','2025-07-10',2,0,1),(200,57,14,'mensal',0,'2025-06-04','2025-07-04',1,0,1),(202,58,15,'mensal',1,'2025-06-04','2025-07-04',1,0,1),(203,24,16,'mensal',4,'2025-06-07','2025-07-07',1,0,1),(204,34,16,'mensal',3,'2025-06-07','2025-07-07',1,0,1),(205,28,3,'mensal',8,'2025-07-08','2025-08-07',8,0,1),(206,28,16,'anual',48,'2025-08-07','2026-08-07',8,0,1),(207,35,16,'mensal',4,'2025-06-22','2025-07-22',0,0,1),(208,55,3,'mensal',1,'2025-06-22','2025-07-22',1,0,1),(209,55,3,'mensal',1,'2025-06-26','2025-07-26',1,0,1),(210,32,3,'mensal',8,'2025-08-19','2025-09-18',8,0,1),(211,32,16,'mensal',4,'2025-06-23','2025-07-23',0,0,0),(212,12,3,'mensal',8,'2025-07-17','2025-08-16',6,0,1),(213,52,16,'mensal',3,'2025-06-09','2025-07-09',3,0,1),(214,15,3,'mensal',8,'2025-07-14','2025-08-13',6,0,1),(215,11,3,'mensal',4,'2025-07-15','2025-08-14',4,0,1),(216,5,3,'mensal',1,'2025-06-23','2025-07-23',1,0,1),(217,59,3,'mensal',4,'2025-06-23','2025-07-23',2,0,1),(218,59,16,'mensal',4,'2025-06-23','2025-07-23',2,0,1),(219,34,3,'mensal',8,'2025-06-28','2025-07-28',6,0,1),(220,34,16,'mensal',4,'2025-06-23','2025-07-23',0,0,1),(221,10,3,'mensal',1,'2025-07-05','2025-08-04',1,0,1),(223,60,16,'mensal',4,'2025-06-30','2025-07-30',1,0,1),(224,61,3,'mensal',4,'2025-06-24','2025-07-24',4,0,1),(225,61,16,'mensal',4,'2025-06-24','2025-07-24',0,0,1),(227,19,3,'mensal',5,'2025-06-17','2025-07-17',5,0,1),(228,29,3,'mensal',1,'2025-05-27','2025-06-26',1,0,1),(230,20,16,'mensal',4,'2025-06-20','2025-07-20',2,0,1),(231,20,3,'mensal',2,'2025-06-20','2025-07-20',2,0,1),(232,13,14,'avulsa',1,'2025-06-28',NULL,1,0,1),(233,15,14,'avulsa',1,'2025-06-28',NULL,1,0,1),(234,1,NULL,'anual',95,'2025-06-25','2026-06-25',71,1,1),(235,3,NULL,'anual',96,'2025-06-28','2026-06-28',19,1,1),(237,8,16,'mensal',3,'2025-06-14','2025-07-14',0,0,1),(238,18,14,'mensal',4,'2025-07-29','2025-08-28',3,0,1),(239,17,16,'mensal',3,'2025-06-16','2025-07-16',1,0,1),(240,57,14,'mensal',4,'2025-07-02','2025-08-01',3,0,1),(241,62,3,'mensal',4,'2025-06-30','2025-07-30',1,0,1),(242,62,16,'mensal',4,'2025-06-30','2025-07-30',0,0,1),(243,5,3,'mensal',4,'2025-07-10','2025-08-09',4,0,1),(244,5,16,'mensal',4,'2025-07-10','2025-08-09',1,0,1),(245,60,3,'mensal',4,'2025-07-16','2025-08-15',2,0,1),(246,39,3,'mensal',4,'2025-07-01','2025-07-31',4,0,1),(247,29,NULL,'trimestral',24,'2025-07-13','2025-10-11',24,1,1),(248,43,3,'mensal',4,'2025-07-17','2025-08-16',3,0,1),(250,55,3,'mensal',4,'2025-07-08','2025-08-07',4,0,1),(251,55,16,'mensal',4,'2025-07-08','2025-08-07',0,0,1),(254,8,3,'mensal',1,'2025-07-05','2025-08-04',1,0,1),(256,25,3,'mensal',4,'2025-07-08','2025-08-07',4,0,1),(257,42,3,'mensal',4,'2025-07-10','2025-08-09',4,0,1),(258,24,3,'mensal',8,'2025-07-17','2025-08-16',8,0,1),(259,24,16,'mensal',4,'2025-09-20','2025-10-20',1,0,1),(260,39,16,'mensal',4,'2025-07-01','2025-07-31',0,0,1),(261,9,3,'trimestral',24,'2025-07-15','2025-10-13',16,0,1),(262,9,16,'trimestral',12,'2025-07-08','2025-10-06',0,0,0),(264,58,15,'mensal',5,'2025-07-30','2025-08-29',5,0,1),(265,64,3,'mensal',4,'2025-07-17','2025-08-16',3,0,1),(266,64,16,'mensal',4,'2025-07-07','2025-08-06',1,0,1),(267,8,3,'mensal',4,'2025-07-12','2025-08-11',4,0,1),(268,8,16,'mensal',4,'2025-07-12','2025-08-11',1,0,1),(269,10,3,'mensal',4,'2025-07-19','2025-08-18',3,0,1),(270,65,3,'mensal',4,'2025-07-10','2025-08-09',4,0,1),(271,65,16,'mensal',4,'2025-07-08','2025-08-07',1,0,1),(272,47,3,'trimestral',23,'2025-07-17','2025-10-15',23,0,1),(273,30,3,'mensal',4,'2025-07-08','2025-08-07',4,0,1),(274,30,16,'mensal',4,'2025-07-08','2025-08-07',3,0,1),(275,37,3,'mensal',8,'2025-07-30','2025-08-29',7,0,1),(276,47,16,'trimestral',12,'2025-07-10','2025-10-08',0,0,0),(277,45,3,'mensal',4,'2025-07-12','2025-08-11',4,0,1),(278,66,NULL,'mensal',4,'2025-07-10','2025-08-09',3,1,1),(279,66,16,'mensal',4,'2025-07-10','2025-08-09',0,0,1),(280,67,5,'mensal',20,'2025-07-10','2025-08-09',20,0,1),(281,20,3,'mensal',4,'2025-07-17','2025-08-16',4,0,1),(282,20,16,'mensal',4,'2025-07-11','2025-08-10',1,0,0),(283,42,3,'mensal',4,'2025-08-07','2025-09-06',4,0,1),(284,38,3,'mensal',8,'2025-07-15','2025-08-14',8,0,1),(285,68,3,'avulsa',1,'2025-07-15',NULL,0,0,1),(286,41,11,'mensal',4,'2025-07-16','2025-08-15',1,0,1),(289,19,3,'trimestral',29,'2025-07-22','2025-10-20',5,0,1),(290,34,3,'mensal',8,'2025-08-09','2025-09-08',8,0,1),(291,34,16,'mensal',4,'2025-08-09','2025-09-08',2,0,1),(293,67,NULL,'anual',50,'2025-07-21','2026-07-21',9,1,1),(295,33,NULL,'anual',95,'2025-07-15','2026-07-15',58,1,1),(296,44,NULL,'anual',95,'2025-07-15','2026-07-15',55,1,1),(297,13,3,'mensal',8,'2025-07-22','2025-08-21',6,0,1),(298,11,3,'mensal',4,'2025-08-19','2025-09-18',4,0,1),(299,12,3,'mensal',8,'2025-08-19','2025-09-18',7,0,1),(300,25,3,'mensal',4,'2025-08-12','2025-09-11',4,0,1),(301,39,3,'mensal',4,'2025-08-05','2025-09-04',4,0,1),(302,39,16,'mensal',4,'2025-08-05','2025-09-04',1,0,1),(304,69,2,'mensal',4,'2025-08-09','2025-09-08',4,0,1),(305,69,16,'mensal',4,'2025-08-04','2025-09-03',0,0,1),(306,27,3,'mensal',4,'2025-08-07','2025-09-06',4,0,1),(307,27,16,'mensal',4,'2025-08-07','2025-09-06',0,0,1),(308,5,3,'mensal',4,'2025-08-14','2025-09-13',4,0,1),(309,5,16,'mensal',4,'2025-08-14','2025-09-13',2,0,1),(310,21,3,'mensal',8,'2025-08-04','2025-09-03',8,0,1),(311,21,16,'mensal',4,'2025-08-04','2025-09-03',0,0,1),(313,57,14,'mensal',4,'2025-08-13','2025-09-12',4,0,1),(314,62,3,'mensal',4,'2025-08-04','2025-09-03',4,0,1),(315,62,16,'mensal',4,'2025-08-04','2025-09-03',2,0,1),(316,42,3,'mensal',4,'2025-08-28','2025-09-27',4,0,1),(318,50,NULL,'trimestral',24,'2025-08-04','2025-11-02',20,1,1),(319,70,NULL,'mensal',4,'2025-08-11','2025-09-10',4,1,1),(320,70,16,'mensal',4,'2025-08-11','2025-09-10',2,0,1),(321,28,NULL,'anual',96,'2025-08-07','2026-08-07',56,1,1),(322,24,3,'mensal',8,'2025-08-18','2025-09-17',8,0,1),(323,71,NULL,'mensal',4,'2025-08-08','2025-09-07',4,1,1),(324,71,16,'mensal',4,'2025-08-08','2025-09-07',0,0,1),(325,56,NULL,'anual',96,'2025-08-07','2026-08-07',46,1,1),(326,30,3,'mensal',4,'2025-08-12','2025-09-11',4,0,1),(327,30,16,'mensal',4,'2025-08-12','2025-09-11',0,0,1),(328,38,3,'mensal',8,'2025-08-14','2025-09-13',7,0,1),(329,43,3,'mensal',4,'2025-08-18','2025-09-17',4,0,1),(330,37,NULL,'trimestral',24,'2025-09-05','2025-12-04',22,1,1),(331,72,3,'trimestral',24,'2025-08-07','2025-11-05',24,0,1),(332,49,3,'mensal',4,'2025-08-23','2025-09-22',4,0,1),(333,49,NULL,'mensal',4,'2025-10-25','2025-11-24',3,1,1),(334,35,3,'mensal',8,'2025-08-14','2025-09-13',8,0,1),(335,17,NULL,'mensal',4,'2025-08-11','2025-09-10',4,1,1),(336,17,16,'mensal',4,'2025-08-11','2025-09-10',2,0,1),(337,15,3,'mensal',8,'2025-08-18','2025-09-17',8,0,1),(338,45,3,'mensal',4,'2025-08-16','2025-09-15',4,0,1),(339,72,16,'mensal',4,'2025-09-04','2025-10-04',0,0,1),(340,46,3,'mensal',8,'2025-08-19','2025-09-18',8,0,1),(341,10,3,'mensal',4,'2025-08-23','2025-09-22',4,0,1),(342,55,3,'mensal',4,'2025-08-12','2025-09-11',4,0,1),(343,55,16,'mensal',4,'2025-08-12','2025-09-11',0,0,1),(344,65,NULL,'mensal',4,'2025-08-21','2025-09-20',4,1,1),(345,65,16,'mensal',4,'2025-08-21','2025-09-20',2,0,1),(346,8,3,'mensal',4,'2025-08-16','2025-09-15',4,0,1),(347,8,16,'mensal',4,'2025-08-16','2025-09-15',1,0,1),(348,20,3,'mensal',4,'2025-08-20','2025-09-19',4,0,1),(349,20,16,'mensal',4,'2025-08-20','2025-09-19',2,0,1),(350,73,NULL,'mensal',8,'2025-08-19','2025-09-18',7,1,1),(351,12,3,'mensal',8,'2025-09-20','2025-10-20',8,0,1),(353,11,3,'mensal',8,'2025-08-28','2025-09-27',8,0,1),(354,75,NULL,'mensal',4,'2025-08-23','2025-09-22',4,1,1),(355,75,16,'mensal',4,'2025-08-23','2025-09-22',0,0,1),(356,64,NULL,'mensal',4,'2025-08-28','2025-09-27',3,1,1),(357,64,16,'mensal',4,'2025-08-28','2025-09-27',0,0,1),(358,13,3,'mensal',8,'2025-08-26','2025-09-25',8,0,1),(359,25,3,'mensal',4,'2025-08-28','2025-09-27',4,0,1),(360,4,NULL,'anual',96,'2025-08-25','2026-08-25',7,1,1),(361,18,NULL,'mensal',4,'2025-09-10','2025-10-10',4,1,1),(362,15,16,'mensal',4,'2025-08-14','2025-09-13',1,0,1),(363,13,16,'mensal',4,'2025-08-26','2025-09-25',2,0,1),(364,57,14,'mensal',4,'2025-09-10','2025-10-10',3,0,1),(365,34,3,'mensal',8,'2025-09-01','2025-10-01',8,0,1),(366,34,16,'mensal',4,'2025-09-01','2025-10-01',1,0,1),(367,62,3,'mensal',4,'2025-09-01','2025-10-01',4,0,1),(368,62,NULL,'mensal',4,'2025-10-05','2025-11-04',2,1,1),(369,39,3,'mensal',4,'2025-09-04','2025-10-04',3,0,1),(370,39,16,'mensal',4,'2025-09-04','2025-10-04',0,0,1),(371,76,3,'mensal',4,'2025-09-02','2025-10-02',4,0,1),(372,27,3,'mensal',4,'2025-09-04','2025-10-04',4,0,1),(373,5,3,'mensal',4,'2025-09-11','2025-10-11',4,0,1),(374,5,16,'mensal',4,'2025-09-11','2025-10-11',1,0,1),(375,42,3,'mensal',4,'2025-09-26','2025-10-26',4,0,1),(377,21,3,'mensal',4,'2025-09-08','2025-10-08',3,0,1),(378,21,16,'mensal',4,'2025-09-08','2025-10-08',0,0,1),(379,71,3,'mensal',4,'2025-09-05','2025-10-05',4,0,1),(380,71,16,'mensal',4,'2025-09-05','2025-10-05',0,0,1),(381,77,NULL,'mensal',4,'2025-09-09','2025-10-09',4,1,1),(382,77,16,'mensal',4,'2025-09-09','2025-10-09',1,0,1),(383,24,3,'mensal',8,'2025-09-20','2025-10-20',8,0,1),(384,49,3,'mensal',4,'2025-09-27','2025-10-27',4,0,1),(385,56,16,'anual',48,'2025-08-01','2026-08-01',8,0,1),(386,69,NULL,'mensal',4,'2025-09-13','2025-10-13',1,1,1),(387,69,16,'mensal',3,'2025-09-13','2025-10-13',0,0,1),(388,73,16,'mensal',3,'2025-08-19','2025-09-18',0,0,1),(389,10,NULL,'mensal',4,'2025-09-07','2025-10-07',0,1,1),(390,8,3,'mensal',4,'2025-09-13','2025-10-13',4,0,1),(391,8,16,'mensal',4,'2025-09-13','2025-10-13',0,0,1),(392,58,15,'mensal',4,'2025-09-10','2025-10-10',4,0,1),(395,70,NULL,'mensal',4,'2025-09-08','2025-10-08',4,1,1),(396,70,NULL,'mensal',4,'2025-10-06','2025-11-05',4,1,1),(397,35,3,'mensal',8,'2025-09-11','2025-10-11',8,0,1),(398,55,3,'mensal',4,'2025-09-09','2025-10-09',4,0,1),(399,55,16,'mensal',4,'2025-09-09','2025-10-09',0,0,1),(400,33,16,'anual',48,'2025-08-01','2026-08-01',2,0,1),(401,44,16,'anual',48,'2025-08-01','2026-08-01',2,0,1),(402,32,NULL,'mensal',4,'2025-09-09','2025-10-09',4,1,1),(403,43,3,'mensal',4,'2025-09-29','2025-10-29',4,0,1),(404,46,3,'mensal',8,'2025-09-23','2025-10-23',8,0,1),(405,30,NULL,'trimestral',23,'2025-09-09','2025-12-08',20,1,1),(406,38,3,'mensal',8,'2025-09-16','2025-10-16',8,0,0),(407,15,3,'mensal',8,'2025-09-15','2025-10-15',7,0,1),(408,15,16,'mensal',4,'2025-09-15','2025-10-15',1,0,1),(409,20,3,'mensal',4,'2025-09-20','2025-10-20',4,0,1),(410,20,16,'mensal',4,'2025-09-20','2025-10-20',1,0,1),(411,45,NULL,'mensal',4,'2025-09-27','2025-10-27',4,1,1),(412,73,NULL,'mensal',8,'2025-09-23','2025-10-23',7,1,1),(413,73,16,'mensal',4,'2025-09-23','2025-10-23',0,0,1),(414,25,3,'mensal',4,'2025-09-25','2025-10-25',4,0,0),(415,13,NULL,'mensal',8,'2025-09-29','2025-10-29',8,1,1),(416,11,3,'mensal',4,'2025-09-30','2025-10-30',4,0,1),(417,34,3,'mensal',8,'2025-10-02','2025-11-01',8,0,1),(418,34,16,'mensal',4,'2025-10-02','2025-11-01',0,0,1),(419,76,NULL,'mensal',4,'2025-10-07','2025-11-06',3,1,1),(420,78,3,'mensal',1,'2025-09-29','2025-10-29',1,0,1),(421,62,3,'mensal',4,'2025-10-07','2025-11-06',3,0,1),(423,90,NULL,'trimestral',24,'2025-11-03','2026-02-01',15,1,1),(424,90,16,'trimestral',12,'2025-10-06','2026-01-04',0,0,1),(426,91,16,'mensal',4,'2025-10-08','2025-11-07',0,0,1),(428,89,NULL,'mensal',4,'2025-10-07','2025-11-06',4,1,1),(429,89,16,'mensal',4,'2025-10-07','2025-11-06',0,0,1),(430,92,NULL,'mensal',4,'2025-10-06','2025-11-05',4,1,1),(431,92,NULL,'mensal',4,'2025-11-03','2025-12-03',3,1,1),(432,5,3,'mensal',4,'2025-10-09','2025-11-08',4,0,1),(434,71,NULL,'mensal',4,'2025-10-03','2025-11-02',4,1,1),(435,91,NULL,'mensal',4,'2025-10-08','2025-11-07',3,1,1),(436,5,NULL,'mensal',4,'2025-11-06','2025-12-06',1,1,1),(437,10,11,'mensal',8,'2025-10-11','2025-11-10',6,0,1),(438,32,NULL,'mensal',4,'2025-10-07','2025-11-06',4,1,1),(439,39,3,'mensal',4,'2025-10-07','2025-11-06',4,0,1),(440,87,NULL,'mensal',4,'2025-10-07','2025-11-06',4,1,1),(442,8,NULL,'mensal',4,'2025-10-11','2025-11-10',4,1,1),(443,27,NULL,'mensal',4,'2025-10-09','2025-11-08',4,1,1),(444,55,NULL,'mensal',4,'2025-10-07','2025-11-06',4,1,1),(445,35,3,'mensal',8,'2025-10-09','2025-11-08',7,0,1),(446,38,3,'mensal',8,'2025-10-14','2025-11-13',7,0,1),(447,57,14,'mensal',4,'2025-10-15','2025-11-14',3,0,1),(448,69,NULL,'mensal',4,'2025-10-18','2025-11-17',4,1,1),(449,24,3,'mensal',8,'2025-10-25','2025-11-24',8,0,1),(450,58,NULL,'mensal',4,'2025-10-22','2025-11-21',4,1,1),(451,70,16,'mensal',4,'2025-10-06','2025-11-05',1,0,1),(452,14,NULL,'trimestral',24,'2025-10-07','2026-01-05',23,1,1),(453,42,NULL,'anual',48,'2025-10-11','2026-10-11',11,1,1),(454,87,16,'mensal',4,'2025-10-07','2025-11-06',0,0,1),(455,77,NULL,'mensal',4,'2025-10-14','2025-11-13',4,1,1),(456,77,16,'mensal',4,'2025-10-14','2025-11-13',0,0,1),(457,93,NULL,'mensal',4,'2025-10-23','2025-11-22',4,1,1),(458,93,16,'mensal',4,'2025-10-13','2025-11-12',0,0,1),(459,43,NULL,'mensal',4,'2025-10-25','2025-11-24',4,1,1),(460,46,3,'mensal',8,'2025-10-28','2025-11-27',8,0,1),(461,47,3,'mensal',2,'2025-10-16','2025-11-15',2,0,1),(462,49,3,'mensal',4,'2025-10-25','2025-11-24',0,0,1),(463,94,15,'mensal',4,'2025-10-15','2025-11-14',4,0,1),(464,29,NULL,'trimestral',24,'2025-10-31','2026-01-29',24,1,1),(465,15,3,'mensal',8,'2025-10-20','2025-11-19',7,0,1),(466,78,NULL,'mensal',7,'2025-10-21','2025-11-20',7,1,1),(468,78,16,'mensal',4,'2025-10-20','2025-11-19',0,0,1),(469,12,3,'mensal',8,'2025-10-18','2025-11-17',6,0,1),(470,25,NULL,'mensal',4,'2025-10-21','2025-11-20',4,1,1),(471,20,NULL,'mensal',4,'2025-10-25','2025-11-24',4,1,1),(472,45,NULL,'mensal',4,'2025-10-25','2025-11-24',3,1,1),(473,11,3,'mensal',4,'2025-10-28','2025-11-27',4,0,1),(474,72,NULL,'anual',96,'2025-10-23','2026-10-23',37,1,1),(475,72,16,'anual',48,'2025-10-23','2026-10-23',0,0,1),(476,47,NULL,'trimestral',24,'2025-12-19','2026-03-19',24,1,1),(477,73,NULL,'mensal',8,'2025-10-24','2025-11-23',7,1,1),(478,32,3,'mensal',4,'2025-10-28','2025-11-27',4,0,1),(479,34,NULL,'mensal',8,'2025-10-27','2025-11-26',8,1,1),(481,70,NULL,'mensal',4,'2026-01-19','2026-02-18',4,1,1),(482,71,NULL,'mensal',4,'2025-10-30','2025-11-29',4,1,1),(483,70,NULL,'anual',48,'2025-10-27','2026-10-27',48,1,1),(484,34,16,'mensal',4,'2025-10-27','2025-11-26',1,0,1),(485,57,14,'mensal',4,'2025-11-19','2025-12-19',3,0,1),(486,13,NULL,'mensal',8,'2025-10-30','2025-11-29',8,1,1),(487,5,NULL,'mensal',4,'2025-11-06','2025-12-06',0,1,1),(488,8,NULL,'mensal',4,'2025-11-08','2025-12-08',4,1,1),(489,27,NULL,'mensal',4,'2025-11-13','2025-12-13',2,1,1),(490,39,NULL,'mensal',4,'2025-11-04','2025-12-04',3,1,1),(491,55,NULL,'mensal',4,'2025-11-04','2025-12-04',4,1,1),(493,87,NULL,'mensal',4,'2025-11-04','2025-12-04',3,1,1),(494,89,NULL,'mensal',4,'2025-11-04','2025-12-04',1,1,1),(496,17,NULL,'mensal',4,'2025-11-03','2025-12-03',4,1,1),(497,17,16,'mensal',4,'2025-11-03','2025-12-03',2,0,1),(498,95,NULL,'mensal',4,'2025-11-03','2025-12-03',4,1,1),(499,95,16,'mensal',4,'2025-11-03','2025-12-03',1,0,1),(500,58,15,'mensal',4,'2025-11-19','2025-12-19',4,0,1),(501,62,3,'mensal',4,'2025-11-10','2025-12-10',4,0,1),(502,62,16,'mensal',4,'2025-11-10','2025-12-10',2,0,1),(503,24,3,'mensal',8,'2025-11-29','2025-12-29',5,0,1),(504,24,16,'mensal',4,'2025-11-29','2025-12-29',0,0,1),(505,10,11,'mensal',4,'2025-11-11','2025-12-11',4,0,1),(506,35,3,'mensal',8,'2025-11-10','2025-12-10',7,0,1),(507,38,3,'mensal',8,'2025-11-25','2025-12-25',8,0,1),(508,77,NULL,'mensal',4,'2025-11-18','2025-12-18',4,1,1),(509,96,NULL,'mensal',4,'2025-11-17','2025-12-17',3,1,1),(510,96,16,'mensal',4,'2025-11-17','2025-12-17',0,0,1),(511,43,3,'mensal',4,'2025-11-25','2025-12-25',4,0,1),(512,46,NULL,'mensal',8,'2025-12-23','2026-01-22',8,1,1),(513,49,3,'mensal',4,'2025-11-29','2025-12-29',2,0,1),(514,20,NULL,'mensal',4,'2025-11-29','2025-12-29',4,1,1),(515,25,NULL,'mensal',4,'2025-11-18','2025-12-18',4,1,1),(516,94,NULL,'mensal',4,'2025-11-26','2025-12-26',4,1,1),(517,15,NULL,'mensal',8,'2025-11-20','2025-12-20',6,1,1),(518,18,NULL,'mensal',4,'2025-12-03','2026-01-02',4,1,1),(519,32,NULL,'mensal',4,'2025-11-25','2025-12-25',4,1,1),(520,41,NULL,'mensal',4,'2025-11-25','2025-12-25',4,1,0),(521,12,3,'mensal',8,'2025-11-20','2025-12-20',6,0,1),(522,97,NULL,'mensal',4,'2025-11-26','2025-12-26',4,1,1),(523,97,16,'mensal',4,'2025-11-26','2025-12-26',0,0,1),(524,98,NULL,'mensal',4,'2025-11-24','2025-12-24',4,1,1),(525,98,16,'mensal',4,'2025-11-24','2025-12-24',0,0,1),(527,50,NULL,'trimestral',24,'2025-12-16','2026-03-16',22,1,1),(528,34,3,'mensal',8,'2025-11-24','2025-12-24',8,0,1),(529,43,16,'mensal',4,'2025-11-22','2025-12-22',1,0,1),(530,93,NULL,'mensal',4,'2025-12-30','2026-01-29',0,1,1),(532,73,NULL,'mensal',8,'2025-11-25','2025-12-25',7,1,1),(534,11,3,'mensal',4,'2025-12-02','2026-01-01',3,0,1),(535,20,16,'mensal',4,'2025-11-29','2025-12-29',2,0,1),(536,47,NULL,'anual',48,'2025-11-27','2026-11-27',2,1,1),(537,94,14,'avulsa',1,'2025-12-03',NULL,1,0,1),(538,8,NULL,'mensal',4,'2025-12-06','2026-01-05',3,1,1),(539,10,NULL,'mensal',4,'2025-12-06','2026-01-05',2,1,1),(540,45,NULL,'mensal',4,'2025-12-01','2025-12-31',4,1,1),(541,57,NULL,'mensal',4,'2026-01-14','2026-02-13',3,1,1),(542,71,NULL,'mensal',4,'2025-12-05','2026-01-04',4,1,1),(543,13,3,'mensal',8,'2025-12-02','2026-01-01',4,0,1),(544,13,16,'mensal',4,'2025-12-02','2026-01-01',0,0,1),(545,89,NULL,'mensal',4,'2025-12-09','2026-01-08',0,1,1),(546,8,16,'mensal',4,'2025-12-06','2026-01-05',0,0,1),(547,24,3,'mensal',8,'2025-12-30','2026-01-29',0,0,1),(548,35,NULL,'mensal',8,'2026-01-08','2026-02-07',8,1,1),(549,37,NULL,'anual',96,'2025-12-05','2026-12-05',13,1,1),(550,39,3,'mensal',5,'2025-12-09','2026-01-08',3,0,1),(551,49,3,'mensal',4,'2025-12-27','2026-01-26',0,0,1),(552,58,15,'mensal',4,'2026-01-14','2026-02-13',0,0,1),(553,77,NULL,'mensal',4,'2025-12-17','2026-01-16',0,1,1),(554,34,16,'mensal',4,'2025-11-24','2025-12-24',2,0,1),(555,62,NULL,'mensal',4,'2025-12-18','2026-01-17',4,1,1),(556,62,16,'mensal',4,'2025-12-11','2026-01-10',0,0,1),(557,12,3,'mensal',8,'2026-01-13','2026-02-12',7,0,1),(558,25,NULL,'mensal',4,'2026-01-13','2026-02-12',4,1,1),(559,32,NULL,'mensal',8,'2026-01-13','2026-02-12',8,1,1),(560,43,NULL,'mensal',4,'2025-12-30','2026-01-29',3,1,1),(561,20,3,'mensal',4,'2026-01-13','2026-02-12',4,0,1),(562,15,3,'mensal',8,'2026-01-13','2026-02-12',7,0,1),(563,89,NULL,'mensal',4,'2026-01-13','2026-02-12',0,1,1),(564,89,16,'mensal',4,'2026-01-13','2026-02-12',0,0,1),(565,39,3,'mensal',4,'2026-01-13','2026-02-12',4,0,1),(566,39,16,'mensal',4,'2026-01-13','2026-02-12',0,0,1),(567,99,NULL,'mensal',4,'2026-01-19','2026-02-18',4,1,1),(568,99,16,'mensal',4,'2026-01-13','2026-02-12',0,0,1),(569,100,NULL,'mensal',8,'2026-01-13','2026-02-12',1,1,1),(570,100,16,'mensal',4,'2026-01-13','2026-02-12',0,0,1),(571,101,NULL,'mensal',4,'2026-01-13','2026-02-12',4,1,1),(572,101,16,'mensal',4,'2026-01-13','2026-02-12',1,0,1),(573,10,3,'mensal',4,'2026-01-13','2026-02-12',4,0,1),(574,10,16,'mensal',4,'2026-01-13','2026-02-12',0,0,1),(575,27,NULL,'mensal',4,'2026-01-13','2026-02-12',4,1,1),(576,27,16,'mensal',4,'2026-01-13','2026-02-12',0,0,1),(577,98,NULL,'mensal',4,'2026-01-13','2026-02-12',3,1,1),(578,98,16,'mensal',4,'2026-01-13','2026-02-12',0,0,1),(579,69,NULL,'mensal',4,'2026-01-19','2026-02-18',3,1,1),(581,102,NULL,'mensal',4,'2026-01-13','2026-02-12',4,1,1),(582,102,16,'mensal',4,'2026-01-13','2026-02-12',0,0,1),(583,71,NULL,'mensal',4,'2026-01-13','2026-02-12',4,1,1),(584,71,16,'mensal',4,'2026-01-13','2026-02-12',0,0,1),(585,6,NULL,'mensal',4,'2026-01-15','2026-02-14',2,1,1),(586,6,16,'mensal',4,'2026-01-13','2026-02-12',1,0,1),(587,8,3,'mensal',5,'2026-01-13','2026-02-12',5,0,1),(588,8,16,'mensal',5,'2026-01-13','2026-02-12',0,0,1),(589,14,NULL,'avulsa',1,'2026-01-13',NULL,1,1,1),(590,16,NULL,'mensal',4,'2026-01-21','2026-02-20',4,1,1),(591,16,16,'mensal',4,'2026-01-14','2026-02-13',0,0,0),(593,34,NULL,'mensal',8,'2026-01-19','2026-02-18',6,1,1),(594,38,NULL,'mensal',8,'2026-01-13','2026-02-12',8,1,1),(595,45,NULL,'mensal',4,'2026-01-19','2026-02-18',4,1,1),(596,73,NULL,'mensal',8,'2026-01-16','2026-02-15',7,1,1),(597,55,NULL,'mensal',5,'2026-01-13','2026-02-12',5,1,1),(598,62,3,'mensal',4,'2026-01-19','2026-02-18',3,0,1),(599,62,16,'mensal',4,'2026-01-19','2026-02-18',1,0,1),(600,76,NULL,'mensal',4,'2026-01-16','2026-02-15',3,1,1),(601,46,3,'mensal',8,'2026-01-22','2026-02-21',6,0,1),(602,49,NULL,'mensal',4,'2026-02-12','2026-03-14',3,1,1),(603,20,16,'mensal',4,'2026-01-15','2026-02-14',2,0,1),(604,103,3,'mensal',8,'2026-01-21','2026-02-20',8,0,1),(607,35,NULL,'mensal',8,'2026-02-05','2026-03-07',8,1,1),(608,104,NULL,'mensal',4,'2026-01-19','2026-02-18',4,1,1),(609,104,16,'mensal',4,'2026-01-19','2026-02-18',0,0,1),(611,105,NULL,'mensal',4,'2026-02-05','2026-03-07',2,1,1),(612,105,16,'mensal',4,'2026-01-19','2026-02-18',0,0,1),(613,12,NULL,'mensal',8,'2026-02-17','2026-03-19',6,1,1),(614,70,16,'mensal',4,'2026-01-19','2026-02-18',0,0,1),(615,43,NULL,'mensal',4,'2026-02-05','2026-03-07',4,1,1),(616,57,14,'mensal',4,'2026-02-18','2026-03-20',2,0,1),(617,5,NULL,'mensal',4,'2026-02-09','2026-03-11',4,1,1),(618,5,16,'mensal',4,'2026-02-09','2026-03-11',1,0,1),(619,20,NULL,'mensal',4,'2026-02-13','2026-03-15',4,1,1),(620,20,16,'mensal',4,'2026-02-17','2026-03-19',2,0,1),(621,43,16,'mensal',4,'2026-02-02','2026-03-04',2,0,1),(622,106,NULL,'mensal',8,'2026-02-09','2026-03-11',6,1,1),(624,106,16,'mensal',4,'2026-02-09','2026-03-11',0,0,1),(626,30,NULL,'trimestral',24,'2026-02-09','2026-05-10',10,1,1),(627,39,3,'mensal',4,'2026-02-10','2026-03-12',3,0,1),(628,69,NULL,'mensal',4,'2026-02-23','2026-03-25',3,1,1),(629,10,3,'mensal',4,'2026-02-10','2026-03-12',4,0,1),(630,107,NULL,'mensal',4,'2026-02-09','2026-03-11',4,1,1),(631,107,16,'mensal',4,'2026-02-09','2026-03-11',0,0,1),(632,32,NULL,'mensal',5,'2026-02-10','2026-03-12',5,1,1),(633,45,NULL,'mensal',4,'2026-02-12','2026-03-14',4,1,1),(634,55,NULL,'mensal',5,'2026-02-10','2026-03-12',5,1,1),(635,89,3,'mensal',4,'2026-02-17','2026-03-19',1,0,1),(636,27,NULL,'mensal',4,'2026-02-11','2026-03-13',4,1,1),(637,108,NULL,'mensal',4,'2026-02-16','2026-03-18',3,1,1),(638,108,16,'mensal',4,'2026-02-09','2026-03-11',0,0,1),(639,71,NULL,'mensal',4,'2026-02-13','2026-03-15',4,1,1),(640,71,16,'mensal',4,'2026-02-13','2026-03-15',0,0,1),(641,25,NULL,'mensal',4,'2026-02-10','2026-03-12',2,1,1),(642,8,NULL,'mensal',4,'2026-02-16','2026-03-18',4,1,1),(644,109,NULL,'mensal',4,'2026-02-11','2026-03-13',4,1,1),(645,109,16,'mensal',4,'2026-02-11','2026-03-13',0,0,1),(646,15,3,'mensal',8,'2026-02-16','2026-03-18',5,0,1),(647,30,16,'mensal',12,'2026-02-09','2026-03-11',1,0,1),(648,38,NULL,'mensal',8,'2026-02-19','2026-03-21',6,1,1),(649,46,3,'mensal',8,'2026-02-24','2026-03-26',6,0,1),(650,49,3,'mensal',4,'2026-03-10','2026-04-09',0,0,1),(651,73,NULL,'mensal',8,'2026-02-20','2026-03-22',0,1,0),(652,16,NULL,'mensal',4,'2026-02-19','2026-03-21',4,1,1),(653,62,3,'mensal',4,'2026-02-23','2026-03-25',3,0,1),(654,62,16,'mensal',4,'2026-02-23','2026-03-25',0,0,1),(655,8,18,'avulsa',1,'2026-02-21',NULL,1,0,1),(656,6,NULL,'mensal',4,'2026-02-21','2026-03-23',4,1,1),(657,8,12,'avulsa',1,'2026-02-28',NULL,1,0,1),(658,12,3,'mensal',8,'2026-03-24','2026-04-23',0,0,1),(659,103,NULL,'mensal',8,'2026-02-25','2026-03-27',6,1,1),(660,14,NULL,'anual',96,'2026-02-26','2027-02-26',4,1,1),(661,5,NULL,'mensal',4,'2026-03-03','2026-04-02',2,1,1),(662,5,16,'mensal',4,'2026-03-03','2026-04-02',0,0,1),(663,57,14,'mensal',4,'2026-03-31','2026-04-30',0,0,1),(664,20,3,'mensal',4,'2026-03-20','2026-04-19',0,0,1),(665,20,16,'mensal',4,'2026-03-20','2026-04-19',0,0,1),(666,35,NULL,'mensal',8,'2026-03-02','2026-04-01',7,1,1),(667,69,NULL,'mensal',4,'2026-03-30','2026-04-29',0,1,1),(668,49,NULL,'mensal',4,'2026-03-07','2026-04-06',1,1,1),(669,45,3,'mensal',4,'2026-03-09','2026-04-08',2,0,1),(670,70,NULL,'mensal',4,'2026-03-09','2026-04-08',1,1,1),(671,70,16,'mensal',4,'2026-03-09','2026-04-08',0,0,1),(672,70,16,'mensal',4,'2026-03-09','2026-04-08',0,0,1),(673,39,3,'mensal',4,'2026-03-10','2026-04-09',0,0,1),(674,34,NULL,'mensal',8,'2026-03-09','2026-04-08',2,1,1),(675,34,16,'mensal',4,'2026-03-09','2026-04-08',0,0,0),(676,110,NULL,'mensal',8,'2026-03-10','2026-04-09',2,1,1),(677,110,16,'mensal',4,'2026-03-10','2026-04-09',0,0,1),(678,111,NULL,'mensal',4,'2026-03-13','2026-04-12',1,1,1),(679,111,16,'mensal',4,'2026-03-13','2026-04-12',0,0,1),(680,107,NULL,'mensal',8,'2026-03-09','2026-04-08',1,1,1),(681,107,16,'mensal',4,'2026-03-09','2026-04-08',0,0,1),(682,10,3,'mensal',4,'2026-03-18','2026-04-17',0,0,1),(683,32,NULL,'mensal',5,'2026-03-12','2026-04-11',1,1,1),(684,71,NULL,'mensal',4,'2026-03-10','2026-04-09',1,1,1),(685,71,16,'mensal',4,'2026-03-10','2026-04-09',0,0,1),(686,112,NULL,'mensal',4,'2026-03-10','2026-04-09',1,1,1),(687,112,16,'mensal',4,'2026-03-10','2026-04-09',0,0,1),(688,113,NULL,'mensal',4,'2026-03-12','2026-04-11',1,1,1),(689,113,16,'mensal',4,'2026-03-12','2026-04-11',0,0,1),(690,114,NULL,'mensal',8,'2026-03-12','2026-04-11',1,1,1),(691,27,NULL,'mensal',4,'2026-03-11','2026-04-10',1,1,1),(692,108,NULL,'mensal',4,'2026-03-23','2026-04-22',0,1,1),(693,115,NULL,'mensal',4,'2026-03-19','2026-04-18',0,1,1),(694,115,16,'mensal',4,'2026-03-19','2026-04-18',0,0,1),(695,8,3,'mensal',4,'2026-03-13','2026-04-12',1,0,1),(696,46,3,'mensal',8,'2026-03-24','2026-04-23',0,0,1),(697,16,NULL,'mensal',4,'2026-03-19','2026-04-18',0,1,1),(698,6,NULL,'mensal',4,'2026-03-17','2026-04-16',0,1,1),(699,116,NULL,'mensal',4,'2026-03-17','2026-04-16',0,1,1),(700,116,16,'mensal',4,'2026-03-17','2026-04-16',0,0,1),(701,55,NULL,'mensal',5,'2026-03-17','2026-04-16',0,1,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=920 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacotes_modalidades`
--

LOCK TABLES `pacotes_modalidades` WRITE;
/*!40000 ALTER TABLE `pacotes_modalidades` DISABLE KEYS */;
INSERT INTO `pacotes_modalidades` VALUES (80,130,3),(81,130,10),(82,130,11),(83,130,12),(84,130,13),(85,130,14),(86,163,3),(87,163,11),(88,163,12),(89,163,13),(90,163,14),(91,165,3),(92,165,11),(93,165,12),(94,165,13),(95,165,14),(96,168,3),(97,168,11),(98,168,12),(99,168,13),(100,168,14),(101,174,11),(102,174,12),(103,174,13),(104,174,14),(110,210,3),(111,210,10),(112,210,11),(113,210,12),(114,210,13),(115,210,14),(116,234,5),(117,234,11),(118,234,12),(119,234,13),(120,234,14),(121,234,15),(122,235,3),(123,235,10),(124,235,11),(125,235,12),(126,235,13),(127,235,14),(128,235,15),(134,265,3),(135,265,11),(136,265,12),(137,265,13),(138,265,14),(139,270,3),(140,270,11),(141,270,12),(142,270,13),(143,270,14),(144,278,3),(145,278,11),(146,278,12),(147,278,13),(148,278,14),(174,295,3),(175,295,11),(176,295,12),(177,295,13),(178,295,14),(179,295,15),(180,296,3),(181,296,11),(182,296,12),(183,296,13),(184,296,14),(185,296,15),(186,304,3),(187,304,11),(188,304,12),(189,304,13),(190,304,14),(201,318,3),(202,318,11),(203,318,12),(204,318,13),(205,318,14),(206,319,3),(207,319,11),(208,319,12),(209,319,13),(210,319,14),(211,321,3),(212,321,11),(213,321,12),(214,321,13),(215,321,14),(216,321,15),(217,323,3),(218,323,11),(219,323,12),(220,323,13),(221,323,14),(222,325,3),(223,325,11),(224,325,12),(225,325,13),(226,325,14),(227,325,15),(228,330,3),(229,330,11),(230,330,12),(231,330,13),(232,330,14),(233,331,3),(234,331,11),(235,331,12),(236,331,13),(237,331,14),(238,335,3),(239,335,11),(240,335,12),(241,335,13),(242,335,14),(243,344,3),(244,344,11),(245,344,12),(246,344,13),(247,344,14),(248,350,3),(249,350,11),(250,350,12),(251,350,13),(252,350,14),(260,354,3),(261,354,11),(262,354,12),(263,354,13),(264,354,14),(265,356,3),(266,356,11),(267,356,12),(268,356,13),(269,356,14),(270,360,3),(271,360,10),(272,360,11),(273,360,12),(274,360,13),(275,360,14),(276,360,15),(282,381,3),(283,381,11),(284,381,12),(285,381,13),(286,381,14),(287,386,3),(288,386,11),(289,386,12),(290,386,13),(291,386,14),(298,395,3),(299,395,11),(300,395,12),(301,395,13),(302,395,14),(303,405,3),(304,405,11),(305,405,12),(306,405,13),(307,405,14),(308,412,3),(309,412,11),(310,412,12),(311,412,13),(312,412,14),(328,428,3),(329,428,11),(330,428,12),(331,428,13),(332,428,14),(333,430,3),(334,430,11),(335,430,12),(336,430,13),(337,430,14),(343,434,3),(344,434,11),(345,434,12),(346,434,13),(347,434,14),(348,435,3),(349,435,11),(350,435,12),(351,435,13),(352,435,14),(353,440,3),(354,440,11),(355,440,12),(356,440,13),(357,440,14),(363,448,3),(364,448,11),(365,448,12),(366,448,13),(367,452,3),(368,452,11),(369,452,12),(370,452,13),(371,452,14),(372,453,3),(373,453,11),(374,453,12),(375,453,13),(376,453,14),(377,453,15),(378,455,3),(379,455,11),(380,455,12),(381,455,13),(382,455,14),(398,474,3),(399,474,11),(400,474,12),(401,474,13),(402,474,14),(403,474,15),(404,477,3),(405,477,11),(406,477,12),(407,477,13),(408,477,14),(436,496,3),(437,496,11),(438,496,12),(439,496,13),(440,496,14),(441,498,3),(442,498,11),(443,498,12),(444,498,13),(445,498,14),(446,508,3),(447,508,11),(448,508,12),(449,508,13),(450,508,14),(451,509,3),(452,509,11),(453,509,12),(454,509,13),(455,509,14),(456,520,3),(457,520,11),(458,520,12),(459,520,13),(460,520,14),(461,522,3),(462,522,11),(463,522,12),(464,522,14),(465,524,3),(466,524,11),(467,524,12),(468,524,13),(469,524,14),(491,532,3),(492,532,11),(493,532,12),(494,532,13),(495,532,14),(512,545,3),(513,545,11),(514,545,12),(515,545,13),(516,545,14),(517,549,3),(518,549,11),(519,549,12),(520,549,13),(521,549,14),(522,549,15),(523,553,3),(524,553,11),(525,553,12),(526,553,13),(527,553,14),(528,563,3),(529,563,11),(530,563,12),(531,563,13),(532,563,14),(533,563,18),(534,563,19),(542,569,3),(543,569,11),(544,569,12),(545,569,13),(546,569,14),(547,569,18),(548,569,19),(549,571,3),(550,571,11),(551,571,12),(552,571,13),(553,571,18),(554,571,19),(555,575,3),(556,575,11),(557,575,12),(558,575,13),(559,575,14),(560,575,18),(561,575,19),(562,577,3),(563,577,11),(564,577,12),(565,577,13),(566,577,14),(567,577,18),(568,577,19),(576,581,3),(577,581,11),(578,581,12),(579,581,13),(580,581,14),(581,581,18),(582,581,19),(583,583,3),(584,583,11),(585,583,12),(586,583,13),(587,583,14),(588,583,18),(589,583,19),(597,589,3),(598,589,11),(599,589,12),(600,589,13),(601,589,14),(602,589,18),(603,589,19),(625,597,3),(626,597,11),(627,597,12),(628,597,13),(629,597,14),(630,597,18),(631,597,19),(646,608,3),(647,608,11),(648,608,12),(649,608,13),(650,608,14),(651,608,18),(652,608,19),(660,617,3),(661,617,11),(662,617,12),(663,617,13),(664,617,14),(665,617,18),(666,617,19),(667,622,3),(668,622,11),(669,622,12),(670,622,13),(671,622,18),(672,622,19),(701,630,3),(702,630,11),(703,630,12),(704,630,13),(705,630,14),(706,630,18),(707,630,19),(715,636,3),(716,636,11),(717,636,12),(718,636,13),(719,636,14),(720,636,18),(721,636,19),(728,639,3),(729,639,11),(730,639,12),(731,639,13),(732,639,14),(733,639,18),(734,639,19),(735,641,3),(736,641,11),(737,641,12),(738,641,13),(739,641,14),(740,641,18),(741,641,19),(742,644,3),(743,644,11),(744,644,12),(745,644,13),(746,644,14),(747,644,18),(748,644,19),(749,651,3),(750,651,11),(751,651,12),(752,651,13),(753,651,14),(754,651,18),(755,651,19),(756,652,3),(757,652,11),(758,652,12),(759,652,13),(760,652,14),(761,652,18),(762,652,19),(763,656,3),(764,656,11),(765,656,12),(766,656,13),(767,656,14),(768,656,18),(769,656,19),(770,659,3),(771,659,11),(772,659,12),(773,659,13),(774,659,14),(775,659,18),(776,659,19),(777,660,3),(778,660,11),(779,660,12),(780,660,13),(781,660,14),(782,660,15),(783,660,18),(784,661,3),(785,661,11),(786,661,12),(787,661,13),(788,661,14),(789,661,18),(790,661,19),(791,666,3),(792,666,11),(793,666,12),(794,666,13),(795,666,14),(796,666,18),(797,666,19),(798,667,3),(799,667,11),(800,667,12),(801,667,13),(802,667,14),(803,667,18),(804,667,19),(805,668,3),(806,668,11),(807,668,12),(808,668,13),(809,668,14),(810,668,18),(811,668,19),(812,670,3),(813,670,11),(814,670,12),(815,670,13),(816,670,14),(817,670,18),(818,670,19),(826,676,3),(827,676,11),(828,676,13),(829,676,14),(830,676,19),(831,678,3),(832,678,11),(833,678,12),(834,678,13),(835,678,14),(836,678,18),(837,678,19),(838,680,3),(839,680,11),(840,680,12),(841,680,13),(842,680,14),(843,680,18),(844,680,19),(845,684,3),(846,684,11),(847,684,12),(848,684,13),(849,684,14),(850,684,18),(851,684,19),(852,686,3),(853,686,11),(854,686,12),(855,686,13),(856,686,14),(857,686,18),(858,686,19),(859,688,3),(860,688,11),(861,688,12),(862,688,13),(863,688,14),(864,688,18),(865,688,19),(866,690,3),(867,690,11),(868,690,13),(869,690,14),(870,690,18),(871,691,3),(872,691,11),(873,691,12),(874,691,13),(875,691,14),(876,691,18),(877,691,19),(878,692,3),(879,692,11),(880,692,12),(881,692,13),(882,692,14),(883,692,18),(884,692,19),(885,693,3),(886,693,11),(887,693,12),(888,693,13),(889,693,14),(890,693,18),(891,693,19),(892,697,3),(893,697,11),(894,697,12),(895,697,13),(896,697,14),(897,697,18),(898,697,19),(899,698,3),(900,698,11),(901,698,12),(902,698,13),(903,698,14),(904,698,18),(905,698,19),(906,699,3),(907,699,11),(908,699,12),(909,699,13),(910,699,14),(911,699,18),(912,699,19);
/*!40000 ALTER TABLE `pacotes_modalidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacotes_utilizacao`
--

DROP TABLE IF EXISTS `pacotes_utilizacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pacotes_utilizacao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pacote_id` int DEFAULT NULL,
  `aula_id` int DEFAULT NULL,
  `data_utilizacao` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `aula_id` (`aula_id`),
  KEY `pacotes_utilizacao_ibfk_1` (`pacote_id`),
  CONSTRAINT `pacotes_utilizacao_ibfk_1` FOREIGN KEY (`pacote_id`) REFERENCES `pacotes_aluno` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pacotes_utilizacao_ibfk_2` FOREIGN KEY (`aula_id`) REFERENCES `aulas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacotes_utilizacao`
--

LOCK TABLES `pacotes_utilizacao` WRITE;
/*!40000 ALTER TABLE `pacotes_utilizacao` DISABLE KEYS */;
/*!40000 ALTER TABLE `pacotes_utilizacao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `professores`
--

DROP TABLE IF EXISTS `professores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `professores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `senha` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dados_pessoais` text COLLATE utf8mb4_unicode_ci,
  `telefone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `especialidade` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `professores`
--

LOCK TABLES `professores` WRITE;
/*!40000 ALTER TABLE `professores` DISABLE KEYS */;
INSERT INTO `professores` VALUES (1,'Professor 01','professor01@gmail.com','senha01',NULL,NULL,NULL,NULL),(5,'Professor02','professor02@gmail.com','$2b$10$ThDow3GCtWZcPNa3QmICJO4CFlerCRJ4CzSkTge181IuhtsrmajaC','','','',''),(6,'Jéssica Brito','jessicabripi@gmail.com','$2b$10$igdLp7LCNEvH33Q9e.iN5OlaEsEAmueRt9MCRxYJmCSH.GUJMBk.e','','','',''),(7,'Keyla Silva ','keylasoliveira86@gmail.com','$2b$10$2jGBf.pczdOvBdfvuCR2eOQf3myMuthanHt4f1tqRZzmQY9ZGSDXC','','','',''),(8,'Brenda Medeiros ','aboutbrendalima@gmail.com','$2b$10$UaRLzrydBFkR.oOIX2m8J.mmpK2xPDfvGbnrY6DmKCg2UDGWanrPa','','','',''),(9,'Felipe ','lflip.esteves@gmail.com','$2b$10$B0BnCp9U3agPGMXpwjtd1.3eGggQsxk03WAjAKXE7YNaw/IL6u556','','','',''),(10,'Treino Livre ','studioartepoledance@gmail.com','$2b$10$QYs2CkOYC1ngwJ2NARYTcenhOMpWZJFypK4unJxsHARzYh9wCneSy','','','',''),(11,'Maria de Fátima Anabia Loura Pio ','anabialoura2@gmail.com','$2b$10$E/tvp6XYwFBPHyS/DZAV6.zWEJbz/zKWQ3AqrNsyzVt.dkM9XNJ2W','','','',''),(12,'Thaynara Hélyda dos Santos Dias ','thayhelyda@gmail.com','$2b$10$Qe/hDpFSC5IfRguadADsGOZZMfcN4092teMD.vKl5grzP1KR6qNky','','','','');
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
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
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

--
-- Table structure for table `uso_creditos`
--

DROP TABLE IF EXISTS `uso_creditos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uso_creditos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pacote_id` int NOT NULL,
  `aluno_id` int NOT NULL,
  `aula_fixa_id` int NOT NULL,
  `data_utilizacao` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `aluno_id` (`aluno_id`),
  KEY `uso_creditos_ibfk_3` (`aula_fixa_id`),
  KEY `uso_creditos_ibfk_1` (`pacote_id`),
  CONSTRAINT `uso_creditos_ibfk_1` FOREIGN KEY (`pacote_id`) REFERENCES `pacotes_aluno` (`id`) ON DELETE CASCADE,
  CONSTRAINT `uso_creditos_ibfk_2` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`),
  CONSTRAINT `uso_creditos_ibfk_3` FOREIGN KEY (`aula_fixa_id`) REFERENCES `aulas_fixas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1977 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uso_creditos`
--

LOCK TABLES `uso_creditos` WRITE;
/*!40000 ALTER TABLE `uso_creditos` DISABLE KEYS */;
INSERT INTO `uso_creditos` VALUES (1490,325,56,206,'2026-01-13'),(1491,577,98,207,'2026-01-13'),(1492,527,50,207,'2026-01-13'),(1493,569,100,207,'2026-01-13'),(1494,597,55,207,'2026-01-13'),(1495,587,8,207,'2026-01-13'),(1496,325,56,207,'2026-01-13'),(1504,541,57,225,'2026-01-14'),(1505,295,33,225,'2026-01-14'),(1506,476,47,213,'2026-01-15'),(1507,560,43,213,'2026-01-15'),(1508,561,20,213,'2026-01-15'),(1509,585,6,213,'2026-01-15'),(1510,555,62,213,'2026-01-15'),(1516,562,15,216,'2026-01-15'),(1517,512,46,216,'2026-01-15'),(1518,594,38,216,'2026-01-15'),(1519,558,25,216,'2026-01-15'),(1520,321,28,216,'2026-01-15'),(1521,548,35,216,'2026-01-15'),(1522,400,33,228,'2026-01-15'),(1523,401,44,228,'2026-01-15'),(1524,603,20,228,'2026-01-15'),(1525,583,71,217,'2026-01-16'),(1526,581,102,217,'2026-01-16'),(1527,600,76,217,'2026-01-16'),(1528,295,33,218,'2026-01-16'),(1529,296,44,218,'2026-01-16'),(1530,596,73,218,'2026-01-16'),(1541,325,56,231,'2026-01-19'),(1542,593,34,231,'2026-01-19'),(1543,234,1,231,'2026-01-19'),(1544,595,45,231,'2026-01-19'),(1545,587,8,231,'2026-01-19'),(1554,577,98,207,'2026-01-20'),(1555,527,50,207,'2026-01-20'),(1556,597,55,207,'2026-01-20'),(1557,596,73,207,'2026-01-20'),(1569,234,1,225,'2026-01-21'),(1576,562,15,216,'2026-01-22'),(1577,548,35,216,'2026-01-22'),(1578,557,12,216,'2026-01-22'),(1579,321,28,216,'2026-01-22'),(1580,586,6,228,'2026-01-22'),(1581,603,20,228,'2026-01-22'),(1588,604,103,217,'2026-01-23'),(1589,234,1,217,'2026-01-23'),(1590,600,76,217,'2026-01-23'),(1591,581,102,217,'2026-01-23'),(1592,596,73,218,'2026-01-23'),(1593,296,44,218,'2026-01-23'),(1594,295,33,218,'2026-01-23'),(1598,325,56,231,'2026-01-26'),(1599,593,34,231,'2026-01-26'),(1600,548,35,231,'2026-01-26'),(1601,595,45,231,'2026-01-26'),(1602,562,15,231,'2026-01-26'),(1611,577,98,207,'2026-01-27'),(1612,527,50,207,'2026-01-27'),(1613,597,55,207,'2026-01-27'),(1614,325,56,207,'2026-01-27'),(1621,541,57,225,'2026-01-28'),(1622,598,62,213,'2026-01-29'),(1623,295,33,213,'2026-01-29'),(1624,560,43,213,'2026-01-29'),(1625,321,28,213,'2026-01-29'),(1626,474,72,213,'2026-01-29'),(1629,562,15,216,'2026-01-29'),(1630,548,35,216,'2026-01-29'),(1631,557,12,216,'2026-01-29'),(1632,594,38,216,'2026-01-29'),(1633,601,46,216,'2026-01-29'),(1634,559,32,216,'2026-01-29'),(1635,206,28,228,'2026-01-29'),(1636,572,101,228,'2026-01-29'),(1642,604,103,217,'2026-01-30'),(1643,234,1,217,'2026-01-30'),(1644,583,71,217,'2026-01-30'),(1645,600,76,217,'2026-01-30'),(1646,575,27,217,'2026-01-30'),(1647,596,73,218,'2026-01-30'),(1648,296,44,218,'2026-01-30'),(1649,295,33,218,'2026-01-30'),(1652,325,56,231,'2026-02-02'),(1653,587,8,231,'2026-02-02'),(1654,234,1,231,'2026-02-02'),(1655,235,3,231,'2026-02-02'),(1656,360,4,231,'2026-02-02'),(1657,293,67,231,'2026-02-02'),(1664,325,56,206,'2026-02-03'),(1665,596,73,206,'2026-02-03'),(1666,527,50,207,'2026-02-03'),(1667,597,55,207,'2026-02-03'),(1668,561,20,207,'2026-02-03'),(1669,548,35,207,'2026-02-03'),(1670,476,47,207,'2026-02-03'),(1673,604,103,241,'2026-02-04'),(1674,575,27,241,'2026-02-04'),(1675,234,1,241,'2026-02-04'),(1676,476,47,213,'2026-02-05'),(1677,295,33,213,'2026-02-05'),(1678,598,62,213,'2026-02-05'),(1683,607,35,216,'2026-02-05'),(1684,557,12,216,'2026-02-05'),(1685,594,38,216,'2026-02-05'),(1686,559,32,216,'2026-02-05'),(1687,601,46,216,'2026-02-05'),(1688,621,43,228,'2026-02-05'),(1694,583,71,217,'2026-02-06'),(1695,234,1,217,'2026-02-06'),(1696,474,72,217,'2026-02-06'),(1697,595,45,217,'2026-02-06'),(1698,596,73,218,'2026-02-06'),(1699,295,33,218,'2026-02-06'),(1703,325,56,231,'2026-02-09'),(1704,593,34,231,'2026-02-09'),(1705,481,70,231,'2026-02-09'),(1706,608,104,231,'2026-02-09'),(1707,567,99,231,'2026-02-09'),(1719,234,1,206,'2026-02-10'),(1720,617,5,206,'2026-02-10'),(1721,360,4,206,'2026-02-10'),(1722,527,50,207,'2026-02-10'),(1723,634,55,207,'2026-02-10'),(1724,234,1,207,'2026-02-10'),(1725,235,3,207,'2026-02-10'),(1726,607,35,207,'2026-02-10'),(1732,296,44,245,'2026-02-10'),(1733,295,33,245,'2026-02-10'),(1734,541,57,225,'2026-02-11'),(1735,234,1,225,'2026-02-11'),(1736,604,103,241,'2026-02-11'),(1737,636,27,241,'2026-02-11'),(1738,549,37,241,'2026-02-11'),(1739,561,20,241,'2026-02-11'),(1740,629,10,241,'2026-02-11'),(1741,644,109,242,'2026-02-11'),(1742,476,47,213,'2026-02-12'),(1743,598,62,213,'2026-02-12'),(1744,602,49,213,'2026-02-12'),(1745,590,16,213,'2026-02-12'),(1750,607,35,216,'2026-02-12'),(1751,557,12,216,'2026-02-12'),(1752,594,38,216,'2026-02-12'),(1753,601,46,216,'2026-02-12'),(1754,633,45,216,'2026-02-12'),(1755,206,28,228,'2026-02-12'),(1760,639,71,217,'2026-02-13'),(1761,549,37,217,'2026-02-13'),(1762,604,103,217,'2026-02-13'),(1763,619,20,217,'2026-02-13'),(1765,596,73,218,'2026-02-13'),(1766,296,44,218,'2026-02-13'),(1767,295,33,218,'2026-02-13'),(1768,474,72,218,'2026-02-13'),(1769,622,106,247,'2026-02-13'),(1770,321,28,247,'2026-02-13'),(1771,616,57,225,'2026-02-18'),(1772,604,103,241,'2026-02-18'),(1773,636,27,241,'2026-02-18'),(1774,629,10,241,'2026-02-18'),(1775,642,8,241,'2026-02-18'),(1776,453,42,242,'2026-02-18'),(1777,295,33,213,'2026-02-19'),(1778,615,43,213,'2026-02-19'),(1779,626,30,213,'2026-02-19'),(1780,641,25,213,'2026-02-19'),(1781,652,16,213,'2026-02-19'),(1783,607,35,216,'2026-02-19'),(1784,613,12,216,'2026-02-19'),(1785,648,38,216,'2026-02-19'),(1786,646,15,216,'2026-02-19'),(1787,321,28,216,'2026-02-19'),(1788,632,32,216,'2026-02-19'),(1789,621,43,228,'2026-02-19'),(1790,618,5,228,'2026-02-19'),(1791,639,71,217,'2026-02-20'),(1792,549,37,217,'2026-02-20'),(1793,604,103,217,'2026-02-20'),(1794,626,30,217,'2026-02-20'),(1795,644,109,217,'2026-02-20'),(1796,295,33,218,'2026-02-20'),(1797,617,5,218,'2026-02-20'),(1798,622,106,247,'2026-02-20'),(1799,321,28,247,'2026-02-20'),(1800,630,107,247,'2026-02-20'),(1801,627,39,247,'2026-02-20'),(1802,527,50,247,'2026-02-20'),(1804,474,72,254,'2026-02-21'),(1807,607,35,231,'2026-02-23'),(1808,646,15,231,'2026-02-23'),(1809,633,45,231,'2026-02-23'),(1810,476,47,231,'2026-02-23'),(1815,325,56,206,'2026-02-24'),(1816,617,5,206,'2026-02-24'),(1817,626,30,206,'2026-02-24'),(1818,527,50,207,'2026-02-24'),(1819,634,55,207,'2026-02-24'),(1820,321,28,207,'2026-02-24'),(1821,453,42,207,'2026-02-24'),(1826,476,47,245,'2026-02-24'),(1827,295,33,245,'2026-02-24'),(1828,234,1,245,'2026-02-24'),(1829,659,103,241,'2026-02-25'),(1830,636,27,241,'2026-02-25'),(1831,549,37,241,'2026-02-25'),(1832,644,109,241,'2026-02-25'),(1833,620,20,252,'2026-02-25'),(1834,476,47,213,'2026-02-26'),(1835,653,62,213,'2026-02-26'),(1836,626,30,213,'2026-02-26'),(1837,660,14,213,'2026-02-26'),(1841,613,12,216,'2026-02-26'),(1842,648,38,216,'2026-02-26'),(1843,649,46,216,'2026-02-26'),(1844,633,45,216,'2026-02-26'),(1845,607,35,216,'2026-02-26'),(1846,206,28,228,'2026-02-26'),(1847,652,16,258,'2026-02-26'),(1848,474,72,258,'2026-02-26'),(1849,629,10,258,'2026-02-26'),(1850,615,43,258,'2026-02-26'),(1851,549,37,217,'2026-02-27'),(1852,659,103,217,'2026-02-27'),(1853,619,20,217,'2026-02-27'),(1854,656,6,217,'2026-02-27'),(1855,642,8,217,'2026-02-27'),(1856,295,33,218,'2026-02-27'),(1857,321,28,247,'2026-02-27'),(1858,234,1,247,'2026-02-27'),(1859,235,3,247,'2026-02-27'),(1860,360,4,247,'2026-02-27'),(1867,646,15,231,'2026-03-02'),(1868,325,56,231,'2026-03-02'),(1869,666,35,231,'2026-03-02'),(1874,206,28,248,'2026-03-02'),(1876,325,56,206,'2026-03-03'),(1877,527,50,207,'2026-03-03'),(1878,634,55,207,'2026-03-03'),(1879,656,6,207,'2026-03-03'),(1880,453,42,207,'2026-03-03'),(1881,661,5,207,'2026-03-03'),(1882,632,32,207,'2026-03-03'),(1883,476,47,245,'2026-03-03'),(1884,295,33,245,'2026-03-03'),(1885,660,14,245,'2026-03-03'),(1886,626,30,245,'2026-03-03'),(1887,474,72,245,'2026-03-03'),(1888,616,57,225,'2026-03-04'),(1889,659,103,241,'2026-03-04'),(1890,636,27,241,'2026-03-04'),(1891,549,37,241,'2026-03-04'),(1892,644,109,241,'2026-03-04'),(1893,639,71,241,'2026-03-04'),(1894,620,20,252,'2026-03-04'),(1895,476,47,213,'2026-03-05'),(1896,660,14,213,'2026-03-05'),(1897,653,62,213,'2026-03-05'),(1898,527,50,213,'2026-03-05'),(1899,474,72,213,'2026-03-05'),(1900,613,12,216,'2026-03-05'),(1901,648,38,216,'2026-03-05'),(1902,649,46,216,'2026-03-05'),(1903,646,15,216,'2026-03-05'),(1904,632,32,216,'2026-03-05'),(1905,633,45,216,'2026-03-05'),(1906,652,16,258,'2026-03-05'),(1907,656,6,258,'2026-03-05'),(1908,649,46,258,'2026-03-05'),(1909,549,37,217,'2026-03-06'),(1910,659,103,217,'2026-03-06'),(1911,642,8,217,'2026-03-06'),(1912,295,33,217,'2026-03-06'),(1913,622,106,247,'2026-03-06'),(1914,630,107,247,'2026-03-06'),(1915,626,30,247,'2026-03-06'),(1916,666,35,247,'2026-03-06'),(1920,325,56,231,'2026-03-09'),(1921,670,70,231,'2026-03-09'),(1922,674,34,231,'2026-03-09'),(1923,628,69,231,'2026-03-09'),(1924,661,5,206,'2026-03-10'),(1925,626,30,206,'2026-03-10'),(1926,453,42,206,'2026-03-10'),(1927,634,55,207,'2026-03-10'),(1928,676,110,207,'2026-03-10'),(1929,476,47,245,'2026-03-10'),(1930,295,33,245,'2026-03-10'),(1931,660,14,245,'2026-03-10'),(1932,296,44,245,'2026-03-10'),(1933,474,72,245,'2026-03-10'),(1934,234,1,262,'2026-03-10'),(1935,635,89,262,'2026-03-10'),(1936,648,38,263,'2026-03-10'),(1937,649,46,263,'2026-03-10'),(1938,684,71,263,'2026-03-10'),(1939,669,45,263,'2026-03-10'),(1940,659,103,241,'2026-03-11'),(1941,549,37,241,'2026-03-11'),(1942,629,10,241,'2026-03-11'),(1943,619,20,241,'2026-03-11'),(1944,647,30,252,'2026-03-11'),(1945,476,47,213,'2026-03-12'),(1946,688,113,213,'2026-03-12'),(1947,653,62,213,'2026-03-12'),(1948,474,72,213,'2026-03-12'),(1949,652,16,213,'2026-03-12'),(1950,613,12,216,'2026-03-12'),(1951,648,38,216,'2026-03-12'),(1952,649,46,216,'2026-03-12'),(1953,646,15,216,'2026-03-12'),(1954,669,45,216,'2026-03-12'),(1955,683,32,216,'2026-03-12'),(1956,626,30,258,'2026-03-12'),(1957,686,112,258,'2026-03-12'),(1958,690,114,258,'2026-03-12'),(1959,656,6,258,'2026-03-12'),(1960,666,35,258,'2026-03-12'),(1961,527,50,264,'2026-03-12'),(1962,676,110,264,'2026-03-12'),(1963,666,35,264,'2026-03-12'),(1964,549,37,217,'2026-03-13'),(1965,659,103,217,'2026-03-13'),(1966,695,8,217,'2026-03-13'),(1967,619,20,217,'2026-03-13'),(1968,234,1,217,'2026-03-13'),(1969,296,44,218,'2026-03-13'),(1970,680,107,247,'2026-03-13'),(1971,678,111,247,'2026-03-13'),(1972,674,34,247,'2026-03-13'),(1973,613,12,247,'2026-03-13'),(1974,666,35,265,'2026-03-13'),(1975,296,44,254,'2026-03-14'),(1976,602,49,254,'2026-03-14');
/*!40000 ALTER TABLE `uso_creditos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-17 14:13:43
