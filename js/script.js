'use strict';

class Table {
    /**
     * полученные аргументы из new Table
     * @param {Object} options
     * arrayNumbers @type {number[]} - массив с числами
     * stringDataObj @type {Object} - объект, внутрь которого будут записаны массивы
     * ei @type {number} - ID пустой клетки по горизонтали по умолчанию
     * ej @type {number} - ID пустой клетки по вертикали
     */
    constructor(options) {
        this._settings = { ...options };

        // копирование массива с числами
        this._arrayNumbers = [...this._settings.arrayNumbers];
        // копирование объекта для заполнения массивами
        this._stringDataObj = { ...this._settings.stringDataObj };
        // изначальное ID положения пустой клетки по горизонтали
        this._ei = this._settings.ei;
        // изначальный ID пустой клетки по вертикали        
        this._ej = this._settings.ej;

        this._initConst();
        this._initEvt();
        this._startNewGame();
    }

    /**
     * перемешиваю изначальный массив данных
     * @returns {Array}
     */
    _shuffleArray() {
        let
            j,
            temp;

        for (let i = this._arrayNumbers.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            temp = this._arrayNumbers[j];
            this._arrayNumbers[j] = this._arrayNumbers[i];
            this._arrayNumbers[i] = temp;
        }

        return this._arrayNumbers;
    }

    /**
     * делаю из массива объект с массивами
     * если поле 4х4, то создаю объект с 4 массивами по 4 элемента на каждую строчку
     */
    _getStringData() {
        let
            stringArr = [],
            stringNumber;

        // заполняю массив
        this._arrayNumbers.forEach((el, i) => {
            stringArr.push(el);

            // если длина полученного массива равна 4,
            // то записываю массив в объект и обнуляю его
            if (stringArr.length === 4) {
                // задаю номера строчек, которым соответствует каждый массив
                if (i < 8) {
                    stringNumber = i > 4 ? 1 : 0;
                } else {
                    stringNumber = i > 12 ? 3 : 2;
                }

                this._stringDataObj[stringNumber] = stringArr;
                stringArr = [];
            }
        });
    }

    /**
     * создаю игровое поле и отрисовываю данные
     */
    _fillTableBody() {
        let
            tbody,
            row,
            cell;

        // обнуляю тело поля
        this.body.innerHTML = '';

        tbody = document.createElement('tbody');
        this.body.appendChild(tbody);

        // создаю строчки
        for (let i = 0; i < 4; i++) {
            row = document.createElement('tr');

            tbody.appendChild(row);

            // создаю поля в строчках
            this._stringDataObj[i].forEach((el, j) => {
                cell = document.createElement('td');
                cell.textContent = el;
                // даю каждому полю свой ID, которы будет зависить от положения 
                cell.id = i + ' ' + j;

                row.appendChild(cell);
            });
        }

        // нахожу пустую клетку
        this._findClearCell();
    }

    /**
     * обработка события по клику на клетки
     * @param {Object} evt 
     */
    _cellClick(evt) {
        const
            target = evt.target,
            // получаю id
            // по горизонтали
            i = target.id.charAt(0),
            // по вертикали
            j = target.id.charAt(2);

        // проверяю нажатую клетку по горизонтали или вертикали,
        // если она находится на той же горизонтали или вертикали и на расстоянии 1 клетки (вправо или влево), то выполняю условие
        if ((i == this._ei && Math.abs(j - this._ej) == 1) || (j == this._ej && Math.abs(i - this._ei) == 1)) {
            document.getElementById(this._ei + ' ' + this._ej).innerHTML = target.innerHTML;
            this._changeArrOrder(evt);
            target.innerHTML = '';
            // устанавливаю новые значения пустой клетки
            this._ei = i;
            this._ej = j;
        }

        // если после нажатия все клетки в правильной последовательности, то показываю победное сообщение
        this._getWinMessage();
    }

    /**
     * меняю последовательность элементов после клика в скопированном массиве
     * @param {Object} evt 
     */
    _changeArrOrder(evt) {
        let nullCell;
        const target = evt.target;

        // нахожу индекс пустой клетки в массиве
        this._arrayNumbers.find((el, i) => {
            if (el === '') {
                nullCell = i;
            }
        });

        // меняю положения элементов в массиве
        this._arrayNumbers.forEach((el, i) => {
            if (el === target.innerHTML) {
                // меняю элемент нажатой клетки на пустую строку
                this._arrayNumbers[i] = this._arrayNumbers[nullCell];
                // элемент пустой строки заполняю данными нажатой клетки
                this._arrayNumbers[nullCell] = target.innerHTML;
            }
        });
    }

    /**
     * условия показа сообщения о победе
     */
    _getWinMessage() {
        // пробегаю весь массив, если все цифры соответстуют парвильному порядку, 
        // то показываю alert о победе
        const isDontPass = !!this._arrayNumbers.find((el, i) => {
            const elNumber = parseInt(el);

            // если elNumber не null или undefinded И не соответствует (индексу + 1), то победу не засчитываю
            if (elNumber && elNumber !== ++i) {
                return true;
            }
        });

        if (!isDontPass) {
            alert('Победа!');
        }
    }

    /**
     * нахожу ID по горизонтали и вертикали пустой клетки
     */
    _findClearCell() {
        for (let i = 0; i < 4; i++) {
            this._stringDataObj[i].forEach((el, j) => {
                if (el === '') {
                    this._ei = i;
                    this._ej = j;
                }
            });
        }
    }

    /**
     * начинаю новую игру
     */
    _startNewGame() {
        this._shuffleArray();
        this._getStringData();
        this._fillTableBody();
    }

    _initConst() {
        this.body = document.querySelector('.table');
        this.button = document.querySelector('button');
    }

    _initEvt() {
        this.body.addEventListener('click', this._cellClick.bind(this));
        this.button.addEventListener('click', this._startNewGame.bind(this));
    }
}

new Table({
    ei: null,
    ej: null,
    stringDataObj: {},
    arrayNumbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '']
});