REATE TABLE IF NOT EXISTS service_logs (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL,
    author VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO service_logs (service_name, author, message) VALUES
('System Init', 'PostgreSQL', '資料庫容器初始化完成，資料表建立成功！'),
('Node.js Service', 'Express API', 'Node.js 微服務已連線至 PostgreSQL cluster。'),
('Python Service', 'FastAPI Worker', 'Python 分析微服務已就緒，開始監控容器指標。');