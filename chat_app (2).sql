-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 28, 2026 at 08:48 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `chat_app`
--

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE `groups` (
  `id` int(11) NOT NULL,
  `group_name` varchar(255) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_broadcast` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `groups`
--

INSERT INTO `groups` (`id`, `group_name`, `created_by`, `created_at`, `is_broadcast`) VALUES
(2, 'eagle', 6, '2026-04-25 05:09:54', 0),
(9, 'abc', 1, '2026-06-28 10:25:09', 0),
(10, 'abc', 1, '2026-06-28 10:36:52', 1),
(11, 'abc1', 1, '2026-06-28 11:00:36', 0);

-- --------------------------------------------------------

--
-- Table structure for table `group_members`
--

CREATE TABLE `group_members` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('admin','member') DEFAULT 'member'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `group_members`
--

INSERT INTO `group_members` (`id`, `group_id`, `user_id`, `role`) VALUES
(30, 10, 2, 'member'),
(31, 10, 3, 'member'),
(32, 10, 1, 'admin'),
(34, 11, 3, 'member'),
(35, 11, 1, 'admin'),
(37, 10, 4, 'member'),
(38, 11, 2, 'member'),
(39, 11, 4, 'member');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `receiver_id` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `seen` tinyint(1) NOT NULL DEFAULT 0,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `file_path` text NOT NULL,
  `file_type` varchar(20) NOT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `reply_to` int(11) DEFAULT 0,
  `group_id` int(11) DEFAULT 0,
  `is_edited` tinyint(1) DEFAULT 0,
  `is_pinned` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `created_at`, `seen`, `is_read`, `file_path`, `file_type`, `is_deleted`, `reply_to`, `group_id`, `is_edited`, `is_pinned`) VALUES
(1, 1, 2, 'hii', '2026-06-26 13:47:57', 1, 1, '', '', 0, 0, 0, 0, 0),
(2, 1, 2, 'yo', '2026-06-26 13:53:54', 1, 1, '', '', 0, 0, 0, 0, 0),
(3, 1, 2, '😄😄', '2026-06-26 13:54:08', 1, 1, '', '', 0, 0, 0, 0, 0),
(4, 1, 2, '[ATTACHMENT]:1782482072_test.jpg.jpg', '2026-06-26 13:54:32', 1, 1, '', '', 0, 0, 0, 0, 0),
(5, 1, 2, '[ATTACHMENT]:1782482092_Training-Report-Somay-Walecha-v3.docx', '2026-06-26 13:54:52', 1, 1, '', '', 0, 0, 0, 0, 0),
(6, 1, 3, 'hii', '2026-06-26 14:09:11', 0, 0, '', '', 0, 0, 0, 0, 0),
(7, 1, 3, 'yo', '2026-06-26 14:09:14', 0, 0, '', '', 0, 0, 0, 0, 0),
(8, 1, 3, 'yo', '2026-06-26 14:09:20', 0, 0, '', '', 0, 0, 0, 0, 0),
(9, 1, 3, '😆😆😆', '2026-06-26 14:09:33', 0, 0, '', '', 0, 0, 0, 0, 0),
(10, 1, 0, 'hii', '2026-06-26 14:46:36', 0, 0, '', '', 0, 0, 6, 0, 0),
(11, 2, 0, 'hii', '2026-06-26 14:46:49', 1, 1, '', '', 0, 0, 6, 0, 0),
(12, 1, 0, '[ATTACHMENT]:1782485229_sp.jpg', '2026-06-26 14:47:09', 0, 0, '', '', 0, 0, 6, 0, 0),
(13, 2, 1, 'hii', '2026-06-26 15:24:38', 1, 1, '', '', 0, 0, 0, 0, 0),
(14, 2, 1, 'yo ', '2026-06-26 15:24:41', 1, 1, '', '', 0, 0, 0, 0, 0),
(15, 2, 1, 'yo', '2026-06-26 15:24:42', 1, 1, '', '', 0, 0, 0, 0, 0),
(16, 1, 2, 'jj', '2026-06-27 05:39:36', 1, 1, '', '', 0, 0, 0, 0, 0),
(17, 2, 1, 'how are you', '2026-06-27 06:23:32', 1, 1, '', '', 0, 0, 0, 0, 0),
(18, 1, 2, 'hii', '2026-06-28 09:18:35', 1, 1, '', '', 0, 0, 0, 0, 0),
(19, 1, 2, 'yo', '2026-06-28 09:19:33', 1, 1, '', '', 0, 0, 0, 0, 0),
(20, 2, 1, 'hi', '2026-06-28 09:19:41', 1, 1, '', '', 0, 0, 0, 0, 0),
(21, 1, 2, 'hi', '2026-06-28 09:20:19', 0, 0, '', '', 0, 0, 0, 0, 0),
(22, 1, 2, '😄😄', '2026-06-28 09:21:41', 0, 0, '', '', 0, 0, 0, 0, 0),
(23, 1, 2, 'hi', '2026-06-28 11:32:38', 0, 0, '', '', 0, 0, 0, 0, 0),
(24, 1, 2, 'kk', '2026-06-28 11:46:45', 0, 0, '', '', 0, 0, 0, 0, 0),
(25, 1, 2, 'yo yo', '2026-06-28 11:48:55', 0, 0, '', '', 0, 0, 0, 1, 1),
(26, 1, 0, 'hi', '2026-06-28 11:53:50', 0, 0, '', '', 0, 0, 11, 0, 0),
(27, 1, 4, 'hii', '2026-06-28 12:00:04', 1, 1, '', '', 0, 0, 0, 0, 0),
(28, 1, 4, 'yo', '2026-06-28 12:00:12', 1, 1, '', '', 0, 0, 0, 0, 0),
(29, 1, 0, 'hii', '2026-06-28 17:59:44', 1, 1, '', '', 0, 0, 10, 0, 0),
(30, 4, 0, 'hi', '2026-06-28 17:59:53', 1, 1, '', '', 0, 0, 10, 0, 0),
(31, 4, 0, 'hii', '2026-06-28 18:12:03', 1, 1, '', '', 0, 0, 10, 0, 0),
(32, 1, 0, 'hi', '2026-06-28 18:14:03', 1, 1, '', '', 0, 0, 10, 0, 0),
(33, 4, 0, 'hi', '2026-06-28 18:14:12', 1, 1, '', '', 0, 0, 10, 0, 0),
(34, 4, 0, 'hii', '2026-06-28 18:20:00', 1, 1, '', '', 0, 0, 10, 0, 0),
(35, 4, 0, 'hi', '2026-06-28 18:20:18', 1, 1, '', '', 0, 0, 10, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `biometric_id` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(100) NOT NULL,
  `status` enum('pending','approved') DEFAULT 'pending',
  `designation` varchar(100) NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_seen` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `biometric_id`, `password`, `role`, `status`, `designation`, `gender`, `created_at`, `last_seen`) VALUES
(1, 'somay walecha', 'BIO-123', '$2y$10$jww/YhRz0BY0FMN4IkIaw.oTABWdkdKb7kbzcoqjMiS90Wy5LKWUS', 'admin', 'approved', 'Intern', 'Male', '2026-06-26 11:59:38', '2026-06-29 00:18:48'),
(2, 'test1', 'BIO-test1', '$2y$10$rx6bGiHTjimEC.2SV.iWiO2zSyQDtJQPktqxPgf1uFuM4Bki8ipq.', 'member', 'approved', 'Scientist-B', 'Male', '2026-06-26 12:11:24', '2026-06-28 23:33:00'),
(3, 'test2', 'Bio-test2', '$2y$10$Fuc3l1t.wCp7gmqy8AF3fO8ahuWAdZD4ws0B8TtmWEM2r3bLpvksm', 'Member', 'approved', 'Scientist-F', 'Male', '2026-06-26 13:46:40', '2026-06-28 23:33:00'),
(4, 'test3', 'Bio-test3', '$2y$10$gbIm4xx54LagYcAXJIkYe.Zm04Yt0T89OZJ/qXp0kmOvrH05hVvE2', 'Member', 'approved', 'intern', 'Male', '2026-06-28 10:37:41', '2026-06-29 00:18:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `group_members`
--
ALTER TABLE `group_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_group_user` (`group_id`,`user_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `biometric_id` (`biometric_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `groups`
--
ALTER TABLE `groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `group_members`
--
ALTER TABLE `group_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
