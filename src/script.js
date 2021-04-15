const
    modalNode = document.querySelector(".modal-overlay"),
    transactionsNode = document.querySelector("tbody"),
    keyStorage = "dev.finances:transactions"


const Utils = {

    generateId() {
        return '_' + Math.random().toString(36).substr(2, 5)
    },


    formatCurrency(value) {

        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })

        return `${signal} ${value}`
    },

   formatDate(date) {

        if (typeof date === 'string')
            date = new Date(date)

        const 
            day = date.getDate().toString().padStart(2, '0'),
            month = (date.getMonth() + 1 ).toString().padStart(2, '0'),
            year = date.getFullYear().toString()
        
       return `${day}/${month}/${year}`
   }




}

const Form = {

    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    isNumber(value) {
        return !Number.isNaN(value)
    },

    isValidDate(value) {
        const newDate = new Date(value)
        return newDate instanceof Date && !isNaN(newDate)
    },


    isValid() {
        
        if (description.value === '') {
            alert('descrição é um campo obrigatório')
            return false;
        }


        if (!Form.isNumber(amount.value)) {
            alert('Valor é inválido')
            return false
        }

        if (!Form.isValidDate(date.value)) {
            alert('Data informada é inválida')
            return false
        }

        return true

    },

    submit(event) {
        event.preventDefault();

        if (!Form.isValid())
            return

        const 
            yesterday = new Date(date.value),
            today = yesterday.setDate(yesterday.getDate() +  1)

        const transaction = {
            description: description.value,
            amount: Number(amount.value) * 100,
            date: new Date(today)
        }


        Transactions.add(transaction)

        Modal.close()

        Form.clear()

    },

    clear(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""

    }
}

const Transactions = {

    add(transaction) {

        transaction.id = Utils.generateId()
        App.transactions.push(transaction)

        const tr = document.createElement("tr")
        tr.setAttribute("id", transaction.id)
        tr.innerHTML = Transactions.addInnerHtmlTransaction(transaction)

        transactionsNode
            .insertAdjacentElement('beforeend', tr)

        Balances.updateBalance()

        Store.set(App.transactions)
    },

    addInnerHtmlTransaction(transaction) {

        const css = transaction.amount > 0 ? 'income' : 'expense'

        return `            
            <td class="description">${transaction.description}</td>
            <td class="${css}"> ${Utils.formatCurrency(transaction.amount)}</td>
            <td class="date">${Utils.formatDate(transaction.date)}</td>
            <td>
                <img onClick="Transactions.remove('${transaction.id}')" src="./assets/minus.svg" alt="Remover transação">
            </td>            
        `

    },


    remove(id) {

        document.getElementById(id)
            .remove()

        const index = App.transactions.findIndex(x => x.id === id)
        App.transactions.splice(index, 1)

        Balances.updateBalance();

        Store.set(App.transactions)


    },




}

const Balances = {

    updateDisplay(type, value) {

        document
            .querySelector(`#${type}Display`)
            .innerHTML = value

    },


    updateBalance() {

        Balances.updateDisplayIncome()
        Balances.updateDisplayExpense()
        Balances.updateDisplayTotal()

    },

    updateDisplayIncome() {

        const incomes = App.transactions
            .map(x => x.amount)
            .filter(x => x >= 0)
            .reduce((acc, currency) => acc + currency, 0)
        const format = Utils.formatCurrency(incomes)

        Balances.updateDisplay('income', format)

    },

    updateDisplayExpense() {

        const expense = App.transactions
            .map(x => x.amount)
            .filter(x => x <= 0)
            .reduce((acc, currency) => acc + currency, 0)
        const format = Utils.formatCurrency(expense)


        Balances.updateDisplay('expense', format)

    },

    updateDisplayTotal() {

        const total = App.transactions
            .map(x => x.amount)
            .reduce((acc, currency) => acc + currency, 0)
        const format = Utils.formatCurrency(total)


        Balances.updateDisplay('total', format)

    },

}

const Modal = {


    open() {

        modalNode
            .classList
            .add("active")
    },

    close() {

        modalNode
            .classList
            .remove("active")
    },
    
    

}


const Store = {
    get() {

        const json = localStorage.getItem(keyStorage) || "[]";
        const transactions = JSON.parse(json)
        return transactions

    },

    set(transactions) {
        const json = JSON.stringify(transactions)
        localStorage.setItem(keyStorage, json)
    }
}

const App = {

    transactions: [],

    init(transactions = []) {

        transactions.forEach(transaction => Transactions.add(transaction))
        Balances.updateBalance()

    },

    startUp() {

        const transactions = Store.get()
        if (transactions.length > 0) {
            App.init(transactions)
            return
        }

        App.init([
            {
                id: Utils.generateId(),
                description: "Luz",
                amount: -50000,
                date: new Date('04/01/2021')
            },
            {
                id: Utils.generateId(),
                description: "Website",
                amount: 50000,
                date: new Date('04/01/2021')
            },
            {
                id: Utils.generateId(),
                description: "Internet",
                amount: -2000,
                date: new Date('04/01/2021')
            }
        ])

    }

}



App.startUp()

