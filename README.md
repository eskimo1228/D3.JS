# collage

Front-End Collage Project

1. To load example.json file to get information.
    This will be used in displaying shapes and elements and getting url.
2. To convert "example.json" file to proper datatype
    ex: {
            "picture": "/img/picture.jpg",
            "elements": [
                {
                    "image": "/img/elements_1.png",
                    "link": "url_1"
                },{
                    "image": "/img/elements_2.png",
                    "link": "url_2"
                },{
                    "image": "/img/elements_3.png",
                    "link": "url_3"
                }
            ],
            "shapes": [
                {
                    "image": "/img/shapes_1.png",
                    "label": "Text_1"
                },{
                    "image": "/img/shapes_2.png",
                    "label": "Text_2"
                }
            ]
        }

    ==>   following  like this
        {
            "children": [
                "image": "/img/picture.jpg",
                {"image": "/img/shapes_1.png", "label": "Text_2"},
                {"image": "/img/elements_2.jpg", "link": "url_2"}
            ]
        }
3. To append svg tag and draw react and label inside it
4. To draw line with initial data.
        *change json file configuration a little. Add one field "router"
    
    *Attention*
        This project work only online status. If you want to run on your local(without online), you have to download following scripts.
            https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css
            https://use.fontawesome.com/releases/v5.0.6/js/all.js
            https://d3js.org/d4.v4.min.js
            https://d3js.org/d3.v3.min.js

" " 
