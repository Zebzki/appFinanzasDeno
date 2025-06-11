-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-06-2025 a las 16:14:25
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
-- Base de datos: `db_finanzas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `idCategoria` int(11) NOT NULL,
  `nombreCategoria` varchar(30) NOT NULL,
  `esIngreso` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`idCategoria`, `nombreCategoria`, `esIngreso`) VALUES
(2, 'Salario Base', 1),
(3, 'Transporte', 0),
(4, 'Freelance', 1),
(5, 'Entretenimiento', 0),
(12, 'Salario', 1),
(13, 'Freelance', 1),
(14, 'Inversiones', 1),
(15, 'Otros Ingresos', 1),
(16, 'Alimentación', 0),
(17, 'Transporte', 0),
(18, 'Entretenimiento', 0),
(19, 'Servicios', 0),
(20, 'Salud', 0),
(21, 'Educación', 0),
(22, 'Ropa', 0),
(23, 'Otros Gastos', 0),
(24, 'Bonificaciones', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuenta`
--

CREATE TABLE `cuenta` (
  `idCuenta` int(11) NOT NULL,
  `nombreCuenta` varchar(35) NOT NULL,
  `idTipoCuenta` int(11) NOT NULL,
  `saldo` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `cuenta`
--

INSERT INTO `cuenta` (`idCuenta`, `nombreCuenta`, `idTipoCuenta`, `saldo`) VALUES
(2, 'Cuenta Corriente Davivienda', 2, 3500000.00),
(3, 'Cuenta Ahorros Nequi', 1, 500000.00),
(4, 'Cuenta Corriente BBVA', 2, 1000000.00),
(5, 'Cuenta Digital Bancolombia', 1, 750000.00),
(6, 'Banco Nacional', 2, 15001.00),
(7, 'Efectivo', 1, 500.00),
(8, 'Visa Gold', 3, 2500.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `presupuesto`
--

CREATE TABLE `presupuesto` (
  `idPresupuesto` int(11) NOT NULL,
  `montoLimite` decimal(10,0) NOT NULL,
  `inicio` datetime NOT NULL,
  `fin` datetime NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `idCategoria` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `presupuesto`
--

INSERT INTO `presupuesto` (`idPresupuesto`, `montoLimite`, `inicio`, `fin`, `idUsuario`, `idCategoria`) VALUES
(2, 500000, '2025-06-01 00:00:00', '2025-06-30 23:59:59', 2, 2),
(3, 300000, '2025-06-01 00:00:00', '2025-06-30 23:59:59', 3, 3),
(4, 800000, '2025-06-01 00:00:00', '2025-06-30 23:59:59', 4, 4),
(5, 400000, '2025-06-01 00:00:00', '2025-06-30 23:59:59', 5, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipocuenta`
--

CREATE TABLE `tipocuenta` (
  `idTipoCuenta` int(11) NOT NULL,
  `tipo` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `tipocuenta`
--

INSERT INTO `tipocuenta` (`idTipoCuenta`, `tipo`) VALUES
(1, 'Cuenta de Ahorros Programado'),
(2, 'Corriente'),
(3, 'Tarjeta de Crédito'),
(4, 'Nómina'),
(5, 'Efectivo'),
(6, 'Inversión'),
(8, 'Cuenta de Inversión'),
(9, 'Tarjeta Débito');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transaccion`
--

CREATE TABLE `transaccion` (
  `idTransaccion` int(11) NOT NULL,
  `monto` decimal(10,0) NOT NULL,
  `fecha` datetime NOT NULL,
  `descripcion` text NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `idCategoria` int(11) NOT NULL,
  `idCuenta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `transaccion`
--

INSERT INTO `transaccion` (`idTransaccion`, `monto`, `fecha`, `descripcion`, `idUsuario`, `idCategoria`, `idCuenta`) VALUES
(2, 120000, '2025-06-06 13:00:00', 'Compra en supermercado', 2, 2, 2),
(3, 40000, '2025-06-07 08:00:00', 'Transporte diario', 3, 3, 3),
(4, 500000, '2025-06-08 18:00:00', 'Proyecto freelance web', 4, 4, 4),
(5, 80000, '2025-06-09 20:30:00', 'Cine y comida rápida', 5, 5, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `idUsuario` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `telefono` varchar(15) NOT NULL,
  `password` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`idUsuario`, `nombre`, `apellido`, `email`, `telefono`, `password`) VALUES
(1, 'Carlos', 'Ramírez', 'carlos.ramirez@mail.com', '3001234567', 'pass123'),
(2, 'Ana', 'López', 'ana.lopez@mail.com', '3002345678', 'pass456'),
(3, 'Luis', 'Gómez', 'luis.gomez@mail.com', '3003456789', 'pass789'),
(4, 'Sofía', 'Martínez', 'sofia.martinez@mail.com', '3004567890', 'pass321'),
(5, 'Pedro', 'Torres', 'pedro.torres@mail.com', '3005678901', 'pass654');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`idCategoria`);

--
-- Indices de la tabla `cuenta`
--
ALTER TABLE `cuenta`
  ADD PRIMARY KEY (`idCuenta`),
  ADD KEY `fk_cuenta_tipocuenta` (`idTipoCuenta`);

--
-- Indices de la tabla `presupuesto`
--
ALTER TABLE `presupuesto`
  ADD PRIMARY KEY (`idPresupuesto`),
  ADD KEY `idx_usuario` (`idUsuario`),
  ADD KEY `idx_categoria` (`idCategoria`);

--
-- Indices de la tabla `tipocuenta`
--
ALTER TABLE `tipocuenta`
  ADD PRIMARY KEY (`idTipoCuenta`);

--
-- Indices de la tabla `transaccion`
--
ALTER TABLE `transaccion`
  ADD PRIMARY KEY (`idTransaccion`),
  ADD KEY `idx_usuario` (`idUsuario`),
  ADD KEY `idx_categoria` (`idCategoria`),
  ADD KEY `idx_cuenta` (`idCuenta`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`idUsuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `idCategoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `cuenta`
--
ALTER TABLE `cuenta`
  MODIFY `idCuenta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `presupuesto`
--
ALTER TABLE `presupuesto`
  MODIFY `idPresupuesto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tipocuenta`
--
ALTER TABLE `tipocuenta`
  MODIFY `idTipoCuenta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `transaccion`
--
ALTER TABLE `transaccion`
  MODIFY `idTransaccion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `idUsuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cuenta`
--
ALTER TABLE `cuenta`
  ADD CONSTRAINT `fk_cuenta_tipocuenta` FOREIGN KEY (`idTipoCuenta`) REFERENCES `tipocuenta` (`idTipoCuenta`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `presupuesto`
--
ALTER TABLE `presupuesto`
  ADD CONSTRAINT `fk_presupuesto_categoria` FOREIGN KEY (`idCategoria`) REFERENCES `categoria` (`idCategoria`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_presupuesto_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `transaccion`
--
ALTER TABLE `transaccion`
  ADD CONSTRAINT `fk_transaccion_categoria` FOREIGN KEY (`idCategoria`) REFERENCES `categoria` (`idCategoria`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_transaccion_cuenta` FOREIGN KEY (`idCuenta`) REFERENCES `cuenta` (`idCuenta`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_transaccion_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
