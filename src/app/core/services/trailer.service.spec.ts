import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TrailerService } from './trailer.service';
import { TrailerLookupService } from './trailer-lookup.service';

describe('TrailerService', () => {
  let service: TrailerService;
  let lookup: jasmine.SpyObj<TrailerLookupService>;

  beforeEach(() => {
    lookup = jasmine.createSpyObj<TrailerLookupService>('TrailerLookupService', ['resolve']);
    TestBed.configureTestingModule({ providers: [{ provide: TrailerLookupService, useValue: lookup }] });
    service = TestBed.inject(TrailerService);
  });

  afterEach(() => (document.body.style.overflow = ''));

  it('opens the resolved trailer and locks page scroll', async () => {
    lookup.resolve.and.returnValue(of({ kind: 'youtube', key: 'dQw4w9WgXcQ' }));

    expect(await service.open({ id: 1, title: 'Heat' })).toBeTrue();
    expect(service.current()).toEqual({ title: 'Heat', trailer: { kind: 'youtube', key: 'dQw4w9WgXcQ' } });

    TestBed.flushEffects();
    expect(document.body.style.overflow).toBe('hidden');

    service.close();
    TestBed.flushEffects();
    expect(service.current()).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('stays closed when the movie has no trailer', async () => {
    lookup.resolve.and.returnValue(of(null));
    expect(await service.open({ id: 2, title: 'Nothing' })).toBeFalse();
    expect(service.current()).toBeNull();
  });
});
