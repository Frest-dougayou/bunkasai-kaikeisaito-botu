const cnt = new Map();//各内容が何回買われたかを記録する
const mp = new Map();//IDと金額を紐づける
const name_mp = new Map();//IDと商品名を紐づける

//--------------------------------------------
//商品を追加したい場合はこの部分をいじる

//mp.set("数字",金額);
mp.set("4946842636501", 500);
mp.set("4902111721217", 1000);
mp.set("4987306055131", 2000);

//name_mp.set("数字","商品名");
name_mp.set("4946842636501", "ビタミン剤");
name_mp.set("4902111721217", "保湿剤");
name_mp.set("4987306055131", "のど飴");

//--------------------------------------------

const print_money = document.getElementById("total_money");
function update_money() {
    let total_money = 0;
    for (const [key, value] of cnt) {
        total_money += mp.get(key) * value;//個数分お金がかかる
        total_money -= Math.floor(value / 3) * 10;//3個買うごとに10円引きする。切り捨てをするときはMath.floorの関数に投げればいいらしい、C++やPythonよりめんどい...()
    }
    print_money.textContent = total_money;
};

const form = document.getElementById("id-form");
form.addEventListener("submit", function () {//Enterキーで渡しても"submit"で受け取れるらしい。入力フォームでsubmitされたらこの関数が動く
    event.preventDefault();//これがないと、フォームを送った瞬間にページが再読み込みされて、0円に戻ってしまう。その再読み込みのイベントをしないでくれ、という指示をするためのコード

    const id = document.getElementById("merchandise-id").value;//.valueで、idを貰える。フォームのforとラベルのnameにmerchandise-idをつけてるからそこで貰ったvalueを見ている
    console.log(id);//デバック用のやつ、F12押して、consoleの項目から見れる

    if (mp.has(id)) {//この商品が存在してるかどうかを見る、存在してなかったら論外
        if (!cnt.has(id)) {//C++とは違って未定義の場合は定義してくれるわけではないので、存在してないならmp.setで定義してあげないといけない
            cnt.set(id, 0);
        }
        cnt.set(id, cnt.get(id) + 1);//javascriptのmapは、cnt[id]++;みたいなのはなくて、値を回収してそれを加算しないといけない、配列はいけるらしい
        update_money();


        const table = document.getElementById("buy-list-table").getElementsByTagName('tbody')[0];//idが"buy-list-table"であるやつの、htmlタグがtbodyであるやつで、そのbuy-list-tableの中にある、[0]、つまり0スタートで1番目のやつを見つける
        let rowUpdated = false;
        // テーブル内のすべての行を取得
        for (let i = 0; i < table.rows.length; i++) {
            const row = table.rows[i];
            const nameCell = row.cells[0];
            // 名前が一致するか確認
            if (nameCell.textContent == name_mp.get(id)) {//for文で見てるセルに書かれてる名前と、今回追加する商品のidと紐づけされてる商品名が一致してるかを見る
                // 一致する行が見つかった場合、その行を更新

                const quantity = document.getElementById(id);
                quantity.textContent++;
                //row.cells[2].textContent++;//ボタンで操作する上で没になった、セルの番号指定とかでやると+-のボタンを無視して数字の部分だけ変更する方法がわからず、結局idを直接見ればよいという結論になった

                rowUpdated = true;
                break;
            }
        }


        // 一致する行が見つからなかった場合、新しい行を追加
        if (!rowUpdated) {
            //tbodyに追加する
            const newRow = table.insertRow();//見つけた内容に、新しい行を挿入する、行を用意しただけでこれに対してセルを追加していかないといけない

            const nameCell = newRow.insertCell(0);//tableの0番目の要素を作成して、それに紐づける
            const moneyCell = newRow.insertCell(1);//tableの1番目の要素を作成して、それに紐づける
            const cntCell = newRow.insertCell(2);//tableの2番目の要素を作成して、それに紐づける

            //cellの値を変更するとき、nameCell=name_mp.get(id);とやっても変更できるけど、これは直接値を代入してるせいでhtmlがうまく動かなくなる。nameCellというのは新しく追加したcellそのものをさしていたわけで、それが直接イコールで変更されるとnameCellの定義的なのが変わってしまってtbodyの中にあるただの数字になってしまうみたいなのが起きる、そのせいでなんかhtmlがうまく動かなくなってフォームのリセットが効かなくなるらしい
            nameCell.textContent = name_mp.get(id);//mp[id]はC++だけなので注意
            moneyCell.textContent = mp.get(id);
            cntCell.textContent = cnt.get(id);

            //ボタン系に関する追加をする。innerHTMLでcntCellの要素のhtml要素を設定できる、onclickはクリックしたときに発動する内容的な感じで、decreaseQuantity('${id}')とあり、decreaseQuantityという関数に'${id}'を引数として渡す、&{id}でidという変数にある中身の値を渡せる、'id'とかだと文字列として"id"というのを渡してしまうのでダメ。htmlをjavascriptから設定する上で、現在このコード上でのidの中身を用いてhtml要素のidとして設定したくてその中身の値を取り出すための記述という感じ
            cntCell.innerHTML = `
            <div class="quantity-container">
                    <button onclick="decreaseQuantity('${id}')">-</button>
                    <span id="${id}">1</span>
                    <button onclick="increaseQuantity('${id}')">+</button>
                </div>
            `;
        }
    }
    else {
        console.log("その商品はありません");
    }

    form.reset();//フォームの中身をなくす、const form = document.getElementById("id_form");なのでformという固有名詞というわけではないので注意(もしそうならform全てがリセットされちゃう)
});


function decreaseQuantity(id) {//減らすボタンのやつ、idにその数字と紐づけしてるidが入ってる
    const target = document.getElementById(id);

    if (target.textContent > 0) {//負にはしないようにする
        cnt.set(id,cnt.get(id)-1);//setじゃないと値の変更ができないので、setの中でgetの数字を貰って変更して渡す
        update_money();
        target.textContent--;
    }
}

function increaseQuantity(id) {//増やすボタンのやつ、idにその数字と紐づけしてるidが入ってる
    const target = document.getElementById(id);

    cnt.set(id,cnt.get(id)+1);
    update_money();
    target.textContent++;
}