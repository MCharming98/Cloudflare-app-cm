/** 
 * Author: CHen Meng
 * Email: c5meng@ucsd.edu
 */

/**
 * Class for handling response elements
 */
class ElementHandler {
  /**
   * Constructor
   * @param {variant} page variant that is fetched
   */
  constructor(variant) {
    this.title;
    this.url;
    if(variant == 1){ 
      this.title = "Chen Meng's LinkedIn page"; 
      this.url = "https://www.linkedin.com/in/chenmeng98/"; //Chen Meng's linkedin profile url
    }
    else{ 
      this.title = "Chen Meng's Github page"; 
      this.url = "https://github.com/MCharming98"; //Chen Meng's Github profile url
    }
  }

  element(element) {
    // An incoming element, such as `div`
    let tag = element.tagName;
    let id = element.getAttribute('id');

    if(tag == 'title' || (tag == 'h1' && id == 'title')){ //Modify page title and title header
      element.setInnerContent(this.title);
    }
    else if(tag == 'p' && id == 'description'){ //Modify the description text
      element.append(" And you can visit " + this.title + "!");
    }
    else if(tag == 'a' && id == 'url'){ //Modify the url and its text
      element.setAttribute('href', this.url);
      element.setAttribute('target', '_blank'); //Open in new window
      element.setInnerContent("Visit " + this.title);
    }

  }
  comments(comment) {}
  text(text) {}
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  //Get the request's cookie, if any
  const cookie = request.headers.get('cookie');
  //Fetch the urls from the variants page
  const response = await fetch('https://cfw-takehome.developers.workers.dev/api/variants');
  const json = await response.json();
  const urls = json['variants'];

  var toFetch; //Stores the url to be fetched, either variant 1 or variant 2
  if (cookie && cookie.includes('variant=1')) { toFetch = urls[0]; } 
  else if (cookie && cookie.includes('variant=2')) { toFetch = urls[1]; }
  else{ 
    //If no cookie, choose a variant page based on 50/50 split
    toFetch = (Math.random() <= 0.5) ? urls[0] : urls[1]; 
  }
  //Number of the variant, either 1 or 2
  const variant = parseInt(toFetch.charAt(toFetch.length-1));

  //Fetch the page and apply modification
  const fetched = await fetch(toFetch);
  let res = new HTMLRewriter()
    .on('*', new ElementHandler(variant))
    .transform(fetched);

  res.headers.append('Set-Cookie', 'variant='+variant);

  return res;

}
