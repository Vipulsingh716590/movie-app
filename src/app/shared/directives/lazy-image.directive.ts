import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';

/**
 * Defers loading an image until it's near the viewport.
 * Usage: <img [appLazyImage]="posterUrl" alt="poster">
 */
@Directive({
  selector: '[appLazyImage]',
  standalone: true
})
export class LazyImageDirective implements OnInit {
  @Input('appLazyImage') src = '';

  private el = inject(ElementRef<HTMLImageElement>);

  ngOnInit(): void {
    const img = this.el.nativeElement;
    img.loading = 'lazy';

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = this.src;
          observer.unobserve(img);
        }
      });
    });

    observer.observe(img);
  }
}
