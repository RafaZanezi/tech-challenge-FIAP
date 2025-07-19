import app from './src/main/app';

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor rodando na porta http://localhost:${port}`);
});
