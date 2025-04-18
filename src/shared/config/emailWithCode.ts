export const email_with_code = (code: string) => {
    return `<!DOCTYPE html>
        <html lang="ru">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Код подтверждения для Swans</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
            }
            .header img {
                max-width: 100%;
                height: auto;
            }
            .content {
                text-align: center;
                padding: 20px 0;
            }
            .code {
                font-size: 24px;
                font-weight: bold;
                color: #333333;
                margin: 20px 0;
                padding: 10px;
                background-color: #f9f9f9;
                border: 1px solid #dddddd;
                border-radius: 4px;
                display: inline-block;
            }
            .footer {
                text-align: center;
                padding-top: 20px;
                font-size: 12px;
                color: #777777;
            }
            .footer a {
                color: #007BFF;
                text-decoration: none;
            }
            .footer a:hover {
                text-decoration: underline;
            }

            /* Адаптивные стили */
            @media only screen and (max-width: 600px) {
                .container {
                    padding: 15px;
                }
                .header h1 {
                    font-size: 24px;
                }
                .content p {
                    font-size: 16px;
                }
                .code {
                    font-size: 20px;
                    padding: 8px;
                }
                .footer {
                    font-size: 10px;
                }
            }

            @media only screen and (max-width: 400px) {
                .header h1 {
                    font-size: 20px;
                }
                .content p {
                    font-size: 14px;
                }
                .code {
                    font-size: 18px;
                    padding: 6px;
                }
                .footer {
                    font-size: 9px;
                }
            }
        </style>
        </head>
        <body>
        <div class="container">
            <div class="header">
                <img src="http://postimg.su/image/oTCRR3qh/SWANS.png" alt="Swans Logo" width="200">
                <h1>Подтверждение входа</h1>
            </div>
            <div class="content">
                <p>Здравствуйте!</p>
                <p>Для завершения аутентификации в приложении Swans, пожалуйста, используйте следующий код подтверждения:</p>
                <div class="code">${code}</div>
                <p>Если вы не запрашивали этот код, пожалуйста, проигнорируйте это письмо.</p>
            </div>
            <div class="footer">
                <p>С уважением, команда Swans</p>
                <p><a href="https://dating-swans.ru">Перейти на сайт</a></p>
                <p>Если у вас возникли вопросы, напишите нам на <a href="mailto:support@dating-swans.ru">support@dating-swans.ru</a></p>
            </div>
        </div>
        </body>
        </html>`;
};
