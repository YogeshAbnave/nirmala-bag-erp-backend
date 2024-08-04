
let arrow = document.querySelectorAll(".arrow");
for (var i = 0; i < arrow.length; i++) {
  arrow[i].addEventListener("click", (e)=>{
 let arrowParent = e.target.parentElement.parentElement;//selecting main parent of arrow
 arrowParent.classList.toggle("showMenu");
  });
}
let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".bx-menu");
console.log(sidebarBtn);
sidebarBtn.addEventListener("click", ()=>{
  sidebar.classList.toggle("close");
});

$(document).ready(function(){
    $(function() {
      $('input[name="daterange"]').daterangepicker({
        "startDate": "01/01/2020",
        "endDate": "17/01/2020",
        opens: 'center',
        locale: {
          format: 'DD/MM/YYYY'
        }
      });
    });
  });

  $(function () {
    $('input')
      .on('change', function (event) {
        var $element = $(event.target);
        var $container = $element.closest('.example');

        if (!$element.data('tagsinput')) return;

        var val = $element.val();
        if (val === null) val = 'null';
        var items = $element.tagsinput('items');

        $('code', $('pre.val', $container)).html(
          $.isArray(val)
            ? JSON.stringify(val)
            : '"' + val.replace('"', '\\"') + '"'
        );
        $('code', $('pre.items', $container)).html(
          JSON.stringify($element.tagsinput('items'))
        );
      })
      .trigger('change');
  });



// document.addEventListener("DOMContentLoaded", function (event) {


//     const showNavbar = (toggleId, navId, bodyId, headerId) => {
//         const toggle = document.getElementById(toggleId),
//             nav = document.getElementById(navId),
//             bodypd = document.getElementById(bodyId),
//             headerpd = document.getElementById(headerId)

//         // Validate that all variables exist
//         if (toggle && nav && bodypd && headerpd) {
//             toggle.addEventListener('click', () => {

//                 // show navbar
//                 nav.classList.toggle('show')
//                 // change icon
//                 toggle.classList.toggle('bx-x')
//                 // add padding to body
//                 bodypd.classList.toggle('body-pd')
//                 // add padding to header
//                 headerpd.classList.toggle('body-pd')
//             })
//         }
//     }

//     showNavbar('header-toggle', 'nav-bar', 'body-pd', 'header')

//     /*===== LINK ACTIVE =====*/
//     const linkColor = document.querySelectorAll('.nav_link')

//     function colorLink() {
//         if (linkColor) {
//             linkColor.forEach(l => l.classList.remove('active'))
//             this.classList.add('active')
//         }
//     }
//     linkColor.forEach(l => l.addEventListener('click', colorLink))

//     // Your code to run since DOM is loaded and ready
// });
// function myFunction() {
//     document.getElementById('nav-bar').className = 'l-navbar show';
//     document.getElementById('body-pd').className = "body-pd";
//     document.getElementById('header').className = "header body-pd";
//     document.getElementById('header-toggle').className = "bx bx-menu bx-x";
// }