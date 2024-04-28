async function getAddresByCep() {
    const cep = document.getElementById('cep').value;
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        console.log(data);
        document.getElementById('rua').value = data.logradouro;
        document.getElementById('bairro').value = data.bairro;
        const cidadeUf = `${data.localidade}/${data.uf}`;
        document.getElementById('cidade').value = cidadeUf;
    } catch (error) {
        alert("Cep inválido. Por favor, insira valores válidos e tente novamente.");
        console.error('Erro ao preencher o endereço pelo CEP:', error);
    }
}

async function getPrevisaoAndSubmit() {
    const lat = document.getElementById('latitude').value;
    const lon = document.getElementById('longitude').value;

    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`
        );

        if (!response.ok) {
            throw new Error('Não foi possível obter os dados de previsão. Verifique os valores de latitude e longitude.');
        }

        const data = await response.json();
        console.log(data);

        const maxTemp = Math.max(...data.hourly.temperature_2m);
        const minTemp = Math.min(...data.hourly.temperature_2m);
        console.log('MaxTemp:', maxTemp);
        console.log('MinTemp:', minTemp);

        const respostaDiv = document.getElementById('resposta');
        respostaDiv.innerHTML = "";

        const diaHora = data.hourly.time[0];
        const dia = diaHora.slice(0, 10); // Extrai apenas a data (correspondentes ao dia)

        const maxTempCelsius = `${maxTemp}°C`;
        const minTempCelsius = `${minTemp}°C`;

        const previsaoFormatted = `<div>Previsão de tempo no dia - ${dia}:</div><div>Temperatura Máxima: ${maxTempCelsius}</div><div>Temperatura Mínima: ${minTempCelsius}</div>`;
        respostaDiv.innerHTML = previsaoFormatted;

        // submete as temperaturas para uma requisição de form
        await submitCombinedForms(maxTempCelsius, minTempCelsius);
        console.log('Submissão de formulários concluída com sucesso!');

    } catch (error) {
        alert(`Erro ao obter dados de previsão: ${error.message}`);
        console.error('Erro ao obter dados de previsão:', error);
    }
}

async function submitCombinedForms(maxTempCelsius, minTempCelsius) {
    const form1 = document.getElementById('weatherForm1');
    const form2 = document.getElementById('weatherForm2');

    const formData = new FormData();

    // Adicione todos os campos do formulário 1 ao objeto FormData
    for (const [name, value] of new FormData(form1)) {
        formData.append(name, value);
    }

    // Adicione todos os campos do formulário 2 ao objeto FormData
    for (const [name, value] of new FormData(form2)) {
        formData.append(name, value);
    }

    // Adicione as temperaturas do formulário 3 ao objeto FormData
    formData.append('Maxima-Temp', maxTempCelsius);
    formData.append('Minima-Temp', minTempCelsius);

    try {
        const response = await fetch('https://api.sheetmonkey.io/form/wwgqQV4d2Rs4hq8v9EbUWP', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Erro ao submeter os formulários.');
        }

        // Redirecione o usuário para a planilha de coleta de dados
        const formLink = 'https://docs.google.com/spreadsheets/d/1OelYoHhu1dUuLqU0Y70FbC8DD1vWshL0I1uWRxJPFFs/edit#gid=0';
        alert('Submissão de formulários concluída com sucesso! Clique para acessar o formulário.');
        window.open(formLink, '_blank');
        console.log('Formulários submetidos com sucesso como uma única requisição.');

    } catch (error) {
        console.error('Erro ao submeter os formulários:', error);
    }
}