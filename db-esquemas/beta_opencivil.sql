-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 21-03-2026 a las 21:45:38
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `beta_opencivil`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bitacora`
--

CREATE TABLE `bitacora` (
  `id_bitacora` int(11) NOT NULL,
  `id_proyecto` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fotos`
--

CREATE TABLE `fotos` (
  `id_foto` int(11) NOT NULL,
  `id_bitacora` int(11) NOT NULL,
  `url_foto` varchar(255) NOT NULL,
  `fecha_subida` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyectos`
--

CREATE TABLE `proyectos` (
  `id_proyecto` int(11) NOT NULL,
  `id_creador` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `ubicacion` varchar(200) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proyectos`
--

INSERT INTO `proyectos` (`id_proyecto`, `id_creador`, `nombre`, `descripcion`, `ubicacion`, `fecha_inicio`, `fecha_creacion`, `activo`) VALUES
(1, 1, 'Proyecto Beta', 'Versión de prueba del sistema', 'Puebla, Mexico', '2026-03-03', '2026-03-04 00:52:55', 1),
(2, 4, 'Proyecto Gamma', 'Proyecto de prueba', 'CDMX', '2026-04-01', '2026-04-01 06:00:00', 1),
(3, 4, 'Proyecto Alfa', 'Intento de edición', 'CDMX', '2026-02-01', '2026-01-01 06:00:00', 1),
(4, 1, 'Proyecto B', 'Proyecto del usuario B', 'CDMX', '2026-01-01', '2026-01-01 06:00:00', 1),
(5, 3, 'Proyecto C', 'Proyecto del usuario C', 'CDMX', '2026-01-01', '2026-01-01 06:00:00', 1),
(6, 4, 'Proyecto D2', 'Intento de edición', 'CDMX', '2026-02-01', '2026-01-01 06:00:00', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyecto_usuarios`
--

CREATE TABLE `proyecto_usuarios` (
  `id_proyecto` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','residente') NOT NULL DEFAULT 'residente',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `correo`, `password`, `rol`, `fecha_registro`) VALUES
(1, 'Edgar', 'admin@opencivil.com', '$2b$10$nzZhAShOFn09r4ZHrzO0zel6q0v1mNSvDpiDYqHbjnLtmWrU5ZODa', 'admin', '2026-03-04 00:52:55'),
(2, 'Ana', 'ana.db@opencivil.com', '$2b$10$0VaVwROB5WSFPrjukl2KOed0yzyjS6CpTfEu0Pbn.hVWJUWc6CQCa', 'admin', '2026-03-04 00:55:58'),
(3, 'Omar', 'omar.front@opencivil.com', '$2b$10$VSd0L5MBRS5MWd5fFPDCtewDT2FeTOK3w/4QKKchrz1mKJYObEMWK', 'residente', '2026-03-04 00:55:58'),
(4, 'Cristian', 'cristian.back@opencivil.com', '$2b$10$76.HQibYv8cjW18la/qF8uigmxYK3ehV8WFQk7txsbXw5T7Ry2Sby', 'residente', '2026-03-04 00:55:58');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `bitacora`
--
ALTER TABLE `bitacora`
  ADD PRIMARY KEY (`id_bitacora`),
  ADD KEY `fk_bitacora_proyecto` (`id_proyecto`),
  ADD KEY `fk_bitacora_usuario` (`id_usuario`);

--
-- Indices de la tabla `fotos`
--
ALTER TABLE `fotos`
  ADD PRIMARY KEY (`id_foto`),
  ADD KEY `fk_foto_bitacora` (`id_bitacora`);

--
-- Indices de la tabla `proyectos`
--
ALTER TABLE `proyectos`
  ADD PRIMARY KEY (`id_proyecto`),
  ADD KEY `fk_proyecto_creador` (`id_creador`);

--
-- Indices de la tabla `proyecto_usuarios`
--
ALTER TABLE `proyecto_usuarios`
  ADD PRIMARY KEY (`id_proyecto`,`id_usuario`),
  ADD KEY `fk_pu_usuario` (`id_usuario`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `bitacora`
--
ALTER TABLE `bitacora`
  MODIFY `id_bitacora` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `fotos`
--
ALTER TABLE `fotos`
  MODIFY `id_foto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proyectos`
--
ALTER TABLE `proyectos`
  MODIFY `id_proyecto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `bitacora`
--
ALTER TABLE `bitacora`
  ADD CONSTRAINT `fk_bitacora_proyecto` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id_proyecto`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bitacora_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `fotos`
--
ALTER TABLE `fotos`
  ADD CONSTRAINT `fk_foto_bitacora` FOREIGN KEY (`id_bitacora`) REFERENCES `bitacora` (`id_bitacora`) ON DELETE CASCADE;

--
-- Filtros para la tabla `proyectos`
--
ALTER TABLE `proyectos`
  ADD CONSTRAINT `fk_proyecto_creador` FOREIGN KEY (`id_creador`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `proyecto_usuarios`
--
ALTER TABLE `proyecto_usuarios`
  ADD CONSTRAINT `fk_pu_proyecto` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id_proyecto`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pu_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
