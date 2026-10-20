package statistic

import "context"

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) FindAll(ctx context.Context) ([]*StatisticWithUser, error) {
	statistics, err := s.repo.FindAll(ctx)
	if err != nil {
		return statistics, err
	}
	return statistics, nil
}

func (s *Service) FindOne(ctx context.Context, id string) (*Statistic, error) {
	statistic, err := s.repo.FindOne(ctx, id)
	if err != nil {
		return nil, err
	}
	return statistic, nil
}

func (s *Service) FindByUser(ctx context.Context, userId string) ([]*Statistic, error) {
	statistics, err := s.repo.FindByUser(ctx, userId)
	if err != nil {
		return nil, err
	}
	return statistics, nil
}

func (s *Service) Save(ctx context.Context, statistic *Statistic) (string, error) {
	insertedId, err := s.repo.Save(ctx, statistic)
	if err != nil {
		return "", err
	}
	return insertedId, nil
}

func (s *Service) Update(ctx context.Context, id string, statistic *Statistic) (string, error) {
	updatedId, err := s.repo.Update(ctx, id, statistic)
	if err != nil {
		return "", err
	}
	return updatedId, nil
}

func (s *Service) Delete(ctx context.Context, id string) error {
	err := s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}

	return nil
}
